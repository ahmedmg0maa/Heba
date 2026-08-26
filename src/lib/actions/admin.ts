'use server'

import { revalidatePath } from 'next/cache'
import { getServiceClient, hasSupabaseServerSecret } from '@/lib/supabase/server'
import { FRESH_ADMIN_ASSURANCE_ERROR, requireFreshAdminAssurance, requirePermission } from '@/lib/auth/permissions'
import { hasSupabasePublicConfig } from '@/lib/supabase/public-key'

type ActionResult<T = null> = { ok: true; data: T } | { ok: false; error: string }
const NO_ENV = 'غير متاح في بيئة العرض التجريبية.'
const NOT_ALLOWED = 'لا تملكين الصلاحية المطلوبة لهذه العملية.'
const GENERIC = 'تعذّر إتمام العملية الآن — حاولي مرة أخرى.'
const hasEnv = () => hasSupabasePublicConfig() && hasSupabaseServerSecret()

function reviewError(message?: string) {
  if (message?.includes('payment_not_found')) return 'الدفعة غير موجودة.'
  if (message?.includes('payment_not_pending')) return 'هذه الدفعة روجعت بالفعل أو لم تعد قابلة للمراجعة.'
  if (message?.includes('order_not_reviewable')) return 'حالة الطلب لا تسمح باعتماد الدفع.'
  if (message?.includes('payment_order_mismatch')) return 'قيمة الدفعة لا تطابق إجمالي الطلب؛ أوقفت العملية للمراجعة.'
  if (message?.includes('invalid_reject_reason')) return 'سبب الرفض يجب أن يكون واضحًا وألا يتجاوز 500 حرف.'
  return GENERIC
}

export async function getProofUrl(paymentId: string): Promise<ActionResult<{ url: string }>> {
  if (!hasEnv()) return { ok: false, error: NO_ENV }
  const admin = await requirePermission('payments.view')
  if (!admin) return { ok: false, error: NOT_ALLOWED }
  const service = getServiceClient()
  const { data: proof } = await service.from('payment_proofs').select('storage_path').eq('payment_id', paymentId).order('created_at', { ascending: false }).limit(1).maybeSingle()
  if (!proof) return { ok: false, error: 'لا يوجد إيصال مرفق.' }
  const { data, error } = await service.storage.from('payment-proofs').createSignedUrl(proof.storage_path, 10 * 60)
  if (error || !data) return { ok: false, error: GENERIC }
  return { ok: true, data: { url: data.signedUrl } }
}

export async function approvePayment(paymentId: string): Promise<ActionResult> {
  if (!hasEnv()) return { ok: false, error: NO_ENV }
  const admin = await requireFreshAdminAssurance('payments.approve')
  if (!admin?.userId) return { ok: false, error: FRESH_ADMIN_ASSURANCE_ERROR }
  const { data, error } = await getServiceClient().rpc('approve_payment_atomic', { p_payment_id: paymentId, p_actor_id: admin.userId })
  if (error) return { ok: false, error: reviewError(error.message) }
  revalidatePath('/admin/payments'); revalidatePath('/admin/orders'); revalidatePath('/admin/overview')
  return { ok: true, data: (data ?? null) as null }
}

export async function rejectPayment(paymentId: string, reason: string): Promise<ActionResult> {
  if (!hasEnv()) return { ok: false, error: NO_ENV }
  const admin = await requireFreshAdminAssurance('payments.reject')
  if (!admin?.userId) return { ok: false, error: FRESH_ADMIN_ASSURANCE_ERROR }
  const trimmed = reason.trim()
  if (trimmed.length < 3 || trimmed.length > 500) return { ok: false, error: 'اكتبي سببًا واضحًا من 3 إلى 500 حرف ليظهر للعميلة.' }
  const { data, error } = await getServiceClient().rpc('reject_payment_atomic', { p_payment_id: paymentId, p_actor_id: admin.userId, p_reason: trimmed })
  if (error) return { ok: false, error: reviewError(error.message) }
  revalidatePath('/admin/payments'); revalidatePath('/admin/orders'); revalidatePath('/admin/overview')
  return { ok: true, data: (data ?? null) as null }
}

export async function updateOrderStatus(orderId: string, status: 'cancelled' | 'refunded' | 'expired', reason?: string): Promise<ActionResult> {
  if (!hasEnv()) return { ok: false, error: NO_ENV }
  const admin = status === 'refunded'
    ? await requireFreshAdminAssurance('orders.refund')
    : await requirePermission('orders.update')
  if (!admin?.userId) return { ok: false, error: status === 'refunded' ? FRESH_ADMIN_ASSURANCE_ERROR : NOT_ALLOWED }
  const { error } = await getServiceClient().rpc('transition_order_atomic', { p_order_id: orderId, p_actor_id: admin.userId, p_status: status, p_reason: reason ?? null })
  if (error) {
    if (error.message.includes('order_not_found')) return { ok: false, error: 'الطلب غير موجود.' }
    if (error.message.includes('invalid_order_transition')) return { ok: false, error: 'حالة الطلب الحالية لا تسمح بهذا الانتقال.' }
    return { ok: false, error: GENERIC }
  }
  revalidatePath('/admin/orders'); revalidatePath('/admin/overview')
  return { ok: true, data: null }
}
