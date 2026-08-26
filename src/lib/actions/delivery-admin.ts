'use server'

import { revalidatePath } from 'next/cache'
import { requirePermission } from '@/lib/auth/permissions'
import { sha256 } from '@/lib/delivery/security'
import { extensionOf, getUploadRule, inspectStoredObject, validateObservedFile } from '@/lib/delivery/file-validation.mjs'
import { getServiceClient } from '@/lib/supabase/server'

type Kind = 'book' | 'lesson-video' | 'lesson-resource' | 'workshop-resource' | 'workshop-recording'
type Result<T> = { ok: true; data: T } | { ok: false; error: string }

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

async function recordInspection(input: { actorId: string; kind: Kind; entityId: string; path: string; declaredMime: string; observedMime?: string; declaredSize: number; observedSize?: number; outcome: 'validated' | 'rejected' | 'quarantined'; reason: string }) {
  await getServiceClient().from('protected_upload_inspections').insert({
    actor_id: input.actorId, upload_kind: input.kind, entity_id: input.entityId, path_hash: sha256(input.path),
    declared_mime: input.declaredMime, observed_mime: input.observedMime, declared_size: input.declaredSize,
    observed_size: input.observedSize, outcome: input.outcome, reason: input.reason.slice(0, 200),
  })
}

export async function beginProtectedUpload(kind: Kind, entityId: string, file: { name: string; type: string; size: number }): Promise<Result<{ bucket: string; path: string; token: string }>> {
  const admin = await requirePermission('learning.manage')
  if (!admin?.userId) return { ok: false, error: 'لا تملكين صلاحية إدارة ملفات التسليم.' }
  const rule = getUploadRule(kind)
  const extension = extensionOf(file.name)
  const type = rule?.extensions[extension]
  if (!rule || !new RegExp(`^${UUID}$`, 'i').test(entityId) || !type || file.size <= 0 || file.size > rule.max || !type.mimes.includes(file.type.toLowerCase())) return { ok: false, error: 'امتداد الملف أو نوعه أو حجمه غير مسموح.' }
  const path = `${kind}/${entityId}/${crypto.randomUUID()}.${extension}`
  const { data, error } = await getServiceClient().storage.from(rule.bucket).createSignedUploadUrl(path)
  if (error || !data) return { ok: false, error: 'تعذّر بدء الرفع الآمن.' }
  return { ok: true, data: { bucket: rule.bucket, path, token: data.token } }
}

export async function finalizeProtectedUpload(kind: Kind, entityId: string, input: { path: string; title: string; size: number; mime: string; format?: string; published?: boolean }): Promise<Result<{ id: string }>> {
  const admin = await requirePermission('learning.manage')
  if (!admin?.userId) return { ok: false, error: 'لا تملكين صلاحية إدارة ملفات التسليم.' }
  const rule = getUploadRule(kind)
  const match = input.path.match(new RegExp(`^${kind}/(${UUID})/(${UUID})\.([a-z0-9]{2,8})$`, 'i'))
  const extension = match?.[3]?.toLowerCase() ?? ''
  const type = rule?.extensions[extension]
  if (!rule || !match || match[1].toLowerCase() !== entityId.toLowerCase() || !type) return { ok: false, error: 'مسار الملف غير صالح.' }

  const declaredMime = input.mime.toLowerCase()
  const service = getServiceClient()
  const inspected = await inspectStoredObject(service.storage, rule.bucket, input.path)
  const valid = validateObservedFile({ rule, type, declaredMime, declaredSize: input.size, observed: inspected })
  if (!inspected || !valid) {
    await service.storage.from(rule.bucket).remove([input.path])
    await recordInspection({ actorId: admin.userId, kind, entityId, path: input.path, declaredMime, observedMime: inspected?.mime, declaredSize: input.size, observedSize: inspected?.size, outcome: 'rejected', reason: 'server_metadata_or_magic_mismatch' })
    return { ok: false, error: 'رُفض الملف لأن نوعه أو حجمه الفعلي لا يطابق البيانات المعلنة.' }
  }

  const scan = await externalScanVerdict(rule.bucket, input.path)
  if (scan === 'unavailable' || scan === 'quarantined') {
    await service.storage.from(rule.bucket).remove([input.path])
    await recordInspection({ actorId: admin.userId, kind, entityId, path: input.path, declaredMime, observedMime: inspected.mime, declaredSize: input.size, observedSize: inspected.size, outcome: 'quarantined', reason: scan === 'unavailable' ? 'configured_scanner_unavailable' : 'scanner_did_not_return_clean' })
    return { ok: false, error: 'لم يجتز الملف فحص الأمان، لذلك لم يُنشر.' }
  }

  const title = input.title.trim().slice(0, 180) || 'ملف محمي'
  let id: string | undefined
  let error
  if (kind === 'book') {
    const version = String(input.format || '1.0').slice(0, 30)
    const versionRow = await service.from('book_versions').upsert({ book_id: entityId, version, changelog: 'رفع من لوحة الإدارة' }, { onConflict: 'book_id,version' }).select('id').single()
    if (versionRow.error) {
      await service.storage.from(rule.bucket).remove([input.path])
      await recordInspection({ actorId: admin.userId, kind, entityId, path: input.path, declaredMime, observedMime: inspected.mime, declaredSize: input.size, observedSize: inspected.size, outcome: 'rejected', reason: 'book_version_binding_failed' })
      return { ok: false, error: 'تعذّر حفظ إصدار الكتاب؛ أزيل الملف بأمان.' }
    }
    const row = await service.from('book_files').insert({ book_id: entityId, version_id: versionRow.data.id, format: extension === 'epub' ? 'epub' : 'pdf', storage_path: input.path, size_bytes: inspected.size }).select('id').single()
    id = row.data?.id; error = row.error
  } else if (kind === 'lesson-video') {
    const row = await service.from('course_lessons').update({ video_path: input.path }).eq('id', entityId).select('id').single()
    id = row.data?.id; error = row.error
  } else if (kind === 'lesson-resource') {
    const resourceKind = ['mp3', 'wav', 'm4a'].includes(extension) ? 'audio' : extension
    const row = await service.from('lesson_resources').insert({ lesson_id: entityId, title, file_path: input.path, kind: resourceKind, size_bytes: inspected.size }).select('id').single()
    id = row.data?.id; error = row.error
  } else if (kind === 'workshop-resource') {
    const resourceKind = ['mp3', 'wav', 'm4a'].includes(extension) ? 'audio' : extension
    const row = await service.from('workshop_resources').insert({ workshop_id: entityId, title, file_path: input.path, kind: resourceKind }).select('id').single()
    id = row.data?.id; error = row.error
  } else {
    const row = await service.from('workshop_recordings').insert({ workshop_id: entityId, title, storage_path: input.path, published_at: input.published ? new Date().toISOString() : null }).select('id').single()
    id = row.data?.id; error = row.error
  }

  if (error || !id) {
    await service.storage.from(rule.bucket).remove([input.path])
    await recordInspection({ actorId: admin.userId, kind, entityId, path: input.path, declaredMime, observedMime: inspected.mime, declaredSize: input.size, observedSize: inspected.size, outcome: 'rejected', reason: 'database_binding_failed' })
    return { ok: false, error: 'رُفع الملف لكن تعذّر ربطه بالمحتوى؛ أزيل بأمان.' }
  }

  await recordInspection({ actorId: admin.userId, kind, entityId, path: input.path, declaredMime, observedMime: inspected.mime, declaredSize: input.size, observedSize: inspected.size, outcome: 'validated', reason: scan === 'clean' ? 'magic_bytes_and_external_scan' : 'magic_bytes_validation' })
  await service.from('audit_logs').insert({ actor_id: admin.userId, action: `delivery.${kind}.uploaded`, entity_type: kind, entity_id: entityId, meta: { size: inspected.size, record_id: id, inspection: 'validated' } })
  revalidatePath('/admin/books'); revalidatePath('/admin/workshops'); revalidatePath('/admin/courses')
  revalidatePath('/dashboard/books'); revalidatePath('/dashboard/workshops')
  return { ok: true, data: { id } }
}
