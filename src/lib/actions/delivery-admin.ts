'use server'

import { revalidatePath } from 'next/cache'
import { requirePermission } from '@/lib/auth/permissions'
import { sha256 } from '@/lib/delivery/security'
import { extensionOf, getUploadRule, inspectStoredObject, validateObservedFile } from '@/lib/delivery/file-validation.mjs'
import { getServiceClient } from '@/lib/supabase/server'

type Kind = 'book' | 'lesson-video' | 'lesson-resource' | 'workshop-resource' | 'workshop-recording'
type Result<T> = { ok: true; data: T } | { ok: false; error: string }
type Inspection = { mime?: string; size?: number }
type BindingResult = { id?: string; outcome?: string; replacedPath?: string | null }
type UploadAuthorization = { authorized?: boolean; outcome?: string; id?: string; declaredMime?: string; declaredSize?: number }
type ArchiveBindingResult = {
  outcome?: string
  recordId?: string
  bucket?: string
  storagePath?: string
  pathHash?: string
  storageCleanupEligible?: boolean
}

const UUID = '[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}'

async function externalScanVerdict(bucket: string, path: string) {
  const endpoint = process.env.PROTECTED_UPLOAD_SCAN_URL
  if (!endpoint) return 'not_configured' as const
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(process.env.PROTECTED_UPLOAD_SCAN_TOKEN ? { Authorization: `Bearer ${process.env.PROTECTED_UPLOAD_SCAN_TOKEN}` } : {}) },
    body: JSON.stringify({ bucket, path }),
    cache: 'no-store',
    signal: AbortSignal.timeout(15_000),
  }).catch(() => null)
  if (!response?.ok) return 'unavailable' as const
  const payload = await response.json().catch(() => null) as { verdict?: string } | null
  return payload?.verdict === 'clean' ? 'clean' as const : 'quarantined' as const
}

async function removePrivateObject(bucket: string, path: string) {
  const { error } = await getServiceClient().storage.from(bucket).remove([path])
  return !error
}

async function recordRejectedUpload(input: {
  actorId: string
  intentId: string
  observed?: Inspection | null
  outcome: 'rejected' | 'quarantined'
  reason: 'signed_upload_issue_failed' | 'direct_storage_upload_failed' | 'server_metadata_or_magic_mismatch' | 'configured_scanner_unavailable' | 'scanner_did_not_return_clean' | 'database_binding_failed' | 'operator_metadata_invalid'
  cleanupConfirmed: boolean
}) {
  return getServiceClient().rpc('record_protected_upload_rejection', {
    p_actor_id: input.actorId,
    p_intent_id: input.intentId,
    p_observed_mime: input.observed?.mime ?? '',
    p_observed_size: input.observed?.size ?? null,
    p_outcome: input.outcome,
    p_reason: input.reason,
    p_cleanup_confirmed: input.cleanupConfirmed,
  })
}

export async function beginProtectedUpload(kind: Kind, entityId: string, file: { name: string; type: string; size: number }): Promise<Result<{ bucket: string; path: string; token: string; intentId: string }>> {
  const admin = await requirePermission('learning.manage')
  if (!admin?.userId) return { ok: false, error: 'لا تملكين صلاحية إدارة ملفات التسليم.' }
  const rule = getUploadRule(kind)
  const extension = extensionOf(file.name)
  const type = rule?.extensions[extension]
  if (!rule || !new RegExp(`^${UUID}$`, 'i').test(entityId) || !type || file.size <= 0 || file.size > rule.max || !type.mimes.includes(file.type.toLowerCase())) return { ok: false, error: 'امتداد الملف أو نوعه أو حجمه غير مسموح.' }
  const path = `${kind}/${entityId}/${crypto.randomUUID()}.${extension}`
  const service = getServiceClient()
  const intent = await service.rpc('begin_protected_upload_intent', {
    p_actor_id: admin.userId,
    p_upload_kind: kind,
    p_entity_id: entityId,
    p_storage_path: path,
    p_path_hash: sha256(path),
    p_declared_mime: file.type.toLowerCase(),
    p_declared_size: file.size,
  })
  const intentId = typeof intent.data === 'string' ? intent.data : null
  if (intent.error || !intentId) return { ok: false, error: 'تعذّر إنشاء تصريح رفع مرتبط بالمحتوى.' }
  const { data, error } = await service.storage.from(rule.bucket).createSignedUploadUrl(path)
  if (error || !data) {
    await recordRejectedUpload({ actorId: admin.userId, intentId, outcome: 'rejected', reason: 'signed_upload_issue_failed', cleanupConfirmed: true })
    return { ok: false, error: 'تعذّر بدء الرفع الآمن.' }
  }
  return { ok: true, data: { bucket: rule.bucket, path, token: data.token, intentId } }
}

export async function abandonProtectedUpload(kind: Kind, entityId: string, input: { intentId: string; path: string }): Promise<void> {
  const admin = await requirePermission('learning.manage')
  const rule = getUploadRule(kind)
  if (!admin?.userId || !rule || !new RegExp(`^${UUID}$`, 'i').test(entityId) || !new RegExp(`^${UUID}$`, 'i').test(input.intentId)) return
  const authorization = await getServiceClient().rpc('authorize_protected_upload_finalization', {
    p_actor_id: admin.userId,
    p_intent_id: input.intentId,
    p_upload_kind: kind,
    p_entity_id: entityId,
    p_storage_path: input.path,
  })
  const authorized = authorization.data as UploadAuthorization | null
  if (authorization.error || !authorized?.authorized) return
  const cleanupConfirmed = await removePrivateObject(rule.bucket, input.path)
  await recordRejectedUpload({ actorId: admin.userId, intentId: input.intentId, outcome: 'rejected', reason: 'direct_storage_upload_failed', cleanupConfirmed })
}

export async function finalizeProtectedUpload(kind: Kind, entityId: string, input: { intentId: string; path: string; title: string; format?: string; published?: boolean }): Promise<Result<{ id: string }>> {
  const admin = await requirePermission('learning.manage')
  if (!admin?.userId) return { ok: false, error: 'لا تملكين صلاحية إدارة ملفات التسليم.' }
  const rule = getUploadRule(kind)
  const match = input.path.match(new RegExp(`^${kind}/(${UUID})/(${UUID})\.([a-z0-9]{2,8})$`, 'i'))
  const extension = match?.[3]?.toLowerCase() ?? ''
  const type = rule?.extensions[extension]
  if (!rule || !new RegExp(`^${UUID}$`, 'i').test(input.intentId) || !match || match[1].toLowerCase() !== entityId.toLowerCase() || !type) return { ok: false, error: 'تصريح الملف أو مساره غير صالح.' }

  const service = getServiceClient()
  const authorization = await service.rpc('authorize_protected_upload_finalization', {
    p_actor_id: admin.userId,
    p_intent_id: input.intentId,
    p_upload_kind: kind,
    p_entity_id: entityId,
    p_storage_path: input.path,
  })
  const authorized = authorization.data as UploadAuthorization | null
  if (authorization.error || !authorized) return { ok: false, error: 'تعذّر التحقق من تصريح هذا الملف.' }
  if (authorized.outcome === 'finalized' && authorized.id) return { ok: true, data: { id: authorized.id } }
  if (!authorized.authorized || authorized.outcome !== 'authorized') return { ok: false, error: 'انتهت صلاحية تصريح الرفع؛ ابدئي رفعًا جديدًا.' }
  const declaredMime = String(authorized.declaredMime ?? '').toLowerCase()
  const declaredSize = Number(authorized.declaredSize)
  if (!Number.isSafeInteger(declaredSize) || declaredSize <= 0 || declaredSize > rule.max || !type.mimes.includes(declaredMime)) return { ok: false, error: 'بيانات تصريح الرفع غير صالحة.' }
  const title = input.title.trim() || 'ملف محمي'
  const version = String(input.format || '1.0').trim()
  const invalidOperatorMetadata = kind === 'book'
    ? version.length < 1 || version.length > 30 || /[\u0000-\u001f\u007f]/.test(version)
    : title.length < 1 || title.length > 180 || /[\u0000-\u001f\u007f]/.test(title)
  if (invalidOperatorMetadata) {
    const cleanupConfirmed = await removePrivateObject(rule.bucket, input.path)
    const evidence = await recordRejectedUpload({ actorId: admin.userId, intentId: input.intentId, outcome: 'rejected', reason: 'operator_metadata_invalid', cleanupConfirmed })
    if (evidence.error) return { ok: false, error: 'رُفض الملف، لكن تعذّر حفظ دليل الفحص. راجعي سجل النظام.' }
    return { ok: false, error: kind === 'book' ? 'رقم الإصدار يجب ألا يتجاوز 30 حرفًا.' : 'عنوان الملف يجب ألا يتجاوز 180 حرفًا.' }
  }
  const inspected = await inspectStoredObject(service.storage, rule.bucket, input.path)
  const valid = validateObservedFile({ rule, type, declaredMime, declaredSize, observed: inspected })
  if (!inspected || !valid) {
    const cleanupConfirmed = await removePrivateObject(rule.bucket, input.path)
    const evidence = await recordRejectedUpload({ actorId: admin.userId, intentId: input.intentId, observed: inspected, outcome: 'rejected', reason: 'server_metadata_or_magic_mismatch', cleanupConfirmed })
    if (evidence.error) return { ok: false, error: 'رُفض الملف، لكن تعذّر حفظ دليل الفحص. راجعي سجل النظام.' }
    return { ok: false, error: 'رُفض الملف لأن نوعه أو حجمه الفعلي لا يطابق البيانات المعلنة.' }
  }

  const scan = await externalScanVerdict(rule.bucket, input.path)
  if (scan === 'unavailable' || scan === 'quarantined') {
    const cleanupConfirmed = await removePrivateObject(rule.bucket, input.path)
    const evidence = await recordRejectedUpload({ actorId: admin.userId, intentId: input.intentId, observed: inspected, outcome: 'quarantined', reason: scan === 'unavailable' ? 'configured_scanner_unavailable' : 'scanner_did_not_return_clean', cleanupConfirmed })
    if (evidence.error) return { ok: false, error: 'حُجر الملف، لكن تعذّر حفظ دليل الفحص. راجعي سجل النظام.' }
    return { ok: false, error: 'لم يجتز الملف فحص الأمان، لذلك لم يُنشر.' }
  }

  const binding = await service.rpc('bind_validated_protected_upload', {
    p_actor_id: admin.userId,
    p_intent_id: input.intentId,
    p_title: title,
    p_version: version,
    p_observed_mime: inspected.mime,
    p_observed_size: inspected.size,
    p_validation_method: scan === 'clean' ? 'magic_bytes_and_external_scan' : 'magic_bytes_validation',
    p_published: input.published === true,
  })
  const bound = binding.data as BindingResult | null
  if (binding.error || !bound?.id) {
    const cleanupConfirmed = await removePrivateObject(rule.bucket, input.path)
    const evidence = await recordRejectedUpload({ actorId: admin.userId, intentId: input.intentId, observed: inspected, outcome: 'rejected', reason: 'database_binding_failed', cleanupConfirmed })
    if (evidence.error) return { ok: false, error: 'لم يُربط الملف، وتعذّر حفظ دليل الفشل. راجعي سجل النظام.' }
    return { ok: false, error: cleanupConfirmed ? 'تعذّر ربط الملف بالمحتوى؛ أزيل بأمان.' : 'تعذّر ربط الملف، وسُجّل للتسوية الآمنة في التخزين.' }
  }

  if (bound.replacedPath && bound.replacedPath !== input.path) {
    const removed = await removePrivateObject(rule.bucket, bound.replacedPath)
    if (!removed) await service.rpc('record_protected_upload_cleanup_failure', { p_actor_id: admin.userId, p_upload_kind: kind, p_entity_id: entityId, p_path_hash: sha256(bound.replacedPath) })
  }
  revalidatePath('/admin/books'); revalidatePath('/admin/workshops'); revalidatePath('/admin/courses')
  revalidatePath('/dashboard/books'); revalidatePath('/dashboard/workshops')
  return { ok: true, data: { id: bound.id } }
}

export async function archiveProtectedDelivery(
  kind: Kind,
  entityId: string,
  recordId: string,
): Promise<Result<{ storageOutcome: 'removed' | 'not_managed' | 'failed'; evidenceRecorded: boolean }>> {
  const admin = await requirePermission('learning.manage')
  if (!admin?.userId) return { ok: false, error: 'لا تملكين صلاحية إزالة ملفات التسليم.' }
  const uuid = new RegExp(`^${UUID}$`, 'i')
  const rule = getUploadRule(kind)
  if (!rule || !uuid.test(entityId) || !uuid.test(recordId)) return { ok: false, error: 'مرجع ملف التسليم غير صالح.' }

  const service = getServiceClient()
  const archived = await service.rpc('archive_protected_delivery_binding', {
    p_actor_id: admin.userId,
    p_delivery_kind: kind,
    p_entity_id: entityId,
    p_record_id: recordId,
  })
  const binding = archived.data as ArchiveBindingResult | null
  if (archived.error || binding?.outcome !== 'archived' || binding.recordId !== recordId
      || typeof binding.storagePath !== 'string' || typeof binding.pathHash !== 'string') {
    return { ok: false, error: 'تعذّر أرشفة ملف التسليم بأمان.' }
  }

  const safePath = /^[A-Za-z0-9][A-Za-z0-9._/-]{0,1023}$/.test(binding.storagePath)
    && !/(^|\/)\.\.(\/|$)/.test(binding.storagePath)
  const authorityMatches = binding.bucket === rule.bucket
    && /^[0-9a-f]{64}$/.test(binding.pathHash)
    && sha256(binding.storagePath) === binding.pathHash
  let storageOutcome: 'removed' | 'not_managed' | 'failed' = 'not_managed'
  if (binding.storageCleanupEligible === true) {
    storageOutcome = safePath && authorityMatches && await removePrivateObject(rule.bucket, binding.storagePath)
      ? 'removed'
      : 'failed'
  }

  const evidence = await service.rpc('record_protected_delivery_cleanup_result', {
    p_actor_id: admin.userId,
    p_delivery_kind: kind,
    p_entity_id: entityId,
    p_record_id: recordId,
    p_path_hash: binding.pathHash,
    p_outcome: storageOutcome,
  })
  revalidatePath('/admin/books')
  revalidatePath('/admin/workshops')
  revalidatePath('/admin/courses', 'layout')
  revalidatePath('/dashboard/books')
  revalidatePath('/dashboard/workshops')
  revalidatePath('/dashboard/courses')
  return { ok: true, data: { storageOutcome, evidenceRecorded: !evidence.error } }
}
