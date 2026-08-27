'use server'

import { getServerClient, getServiceClient, hasSupabaseServerSecret } from '@/lib/supabase/server'
import { rateLimit, RATE_LIMIT_MSG } from '@/lib/rate-limit'
import { hasSupabasePublicConfig } from '@/lib/supabase/public-key'
import { inspectStoredObject } from '@/lib/delivery/file-validation.mjs'
import { validateObservedPaymentProof } from '@/lib/payment-proof-validation.mjs'

type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string }
const GENERIC_ERROR = 'حدث خطأ غير متوقع — حاولي مرة أخرى.'
const NO_ENV_ERROR = 'إتمام الطلبات غير متاح في بيئة العرض التجريبية.'
const hasEnv = () => hasSupabasePublicConfig() && hasSupabaseServerSecret()

export type CouponResult = { code: string; discount: number; couponId: string }

export async function validateCoupon(code: string, productId: string, variantId?: string): Promise<ActionResult<CouponResult>> {
  if (!hasEnv()) return { ok: false, error: 'الكوبونات غير متاحة في بيئة العرض.' }
  const supabase = await getServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'سجّلي دخولك أولًا.' }
  const rl = await rateLimit('coupon', 10, 5 * 60)
  if (!rl.allowed) return { ok: false, error: RATE_LIMIT_MSG }
  const normalized = code.trim().toUpperCase()
  if (normalized.length < 2 || normalized.length > 50) return { ok: false, error: 'هذا الكوبون غير صالح أو منتهي.' }
  const { data, error } = await getServiceClient().rpc('calculate_checkout_quote', {
    p_actor_id: user.id,
    p_product_id: productId,
    p_variant_id: variantId ?? null,
    p_coupon_code: normalized,
  })
  if (error || !data?.couponId) return { ok: false, error: checkoutError(error?.message) }
  return {
    ok: true,
    data: { code: String(data.couponCode), discount: Number(data.couponDiscount), couponId: String(data.couponId) },
  }
}

export type CreatedOrder = { orderId: string; total: number; expiresAt: string; status: 'pending_payment' | 'paid' }

function checkoutError(message?: string) {
  if (message?.includes('product_unavailable')) return 'هذا المنتج غير متاح.'
  if (message?.includes('coupon_invalid')) return 'هذا الكوبون غير صالح أو منتهي.'
  if (message?.includes('coupon_exhausted')) return 'اكتمل الحد الأقصى لاستخدام هذا الكوبون.'
  if (message?.includes('coupon_user_limit')) return 'استخدمتِ هذا الكوبون من قبل.'
  if (message?.includes('coupon_stacking_not_allowed')) return 'لا يمكن الجمع بين هذا الكوبون والعرض الحالي.'
  if (message?.includes('coupon_scope_mismatch')) return 'هذا الكوبون لا ينطبق على المنتج المختار.'
  if (message?.includes('invalid_payment_method')) return 'وسيلة الدفع غير متاحة.'
  if (message?.includes('checkout_idempotency_conflict')) return 'تغيّرت بيانات الطلب أثناء المحاولة؛ راجعي الاختيارات ثم أعيدي المحاولة.'
  return GENERIC_ERROR
}

export async function createOrder(input: { productId: string; variantId?: string; couponCode?: string; method: 'instapay' | 'wallet' | 'bank_transfer'; requestId: string }): Promise<ActionResult<CreatedOrder>> {
  if (!hasEnv()) return { ok: false, error: NO_ENV_ERROR }
  const supabase = await getServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'سجّلي دخولك أولًا.' }
  const rl = await rateLimit('checkout', 10, 10 * 60)
  if (!rl.allowed) return { ok: false, error: RATE_LIMIT_MSG }
  const { data, error } = await getServiceClient().rpc('create_product_order_v3', {
    p_actor_id: user.id,
    p_product_id: input.productId,
    p_variant_id: input.variantId ?? null,
    p_coupon_code: input.couponCode ?? '',
    p_method: input.method,
    p_request_id: input.requestId,
  })
  if (error || !data) return { ok: false, error: checkoutError(error?.message) }
  return {
    ok: true,
    data: {
      orderId: String(data.order_id),
      total: Number(data.total),
      expiresAt: String(data.expires_at),
      status: data.status === 'paid' ? 'paid' : 'pending_payment',
    },
  }
}

function proofError(message?: string) {
  if (message?.includes('order_not_found')) return 'الطلب غير موجود.'
  if (message?.includes('order_expired')) return 'انتهت صلاحية هذا الطلب — أنشئي طلبًا جديدًا.'
  if (message?.includes('order_not_pending')) return 'هذا الطلب ليس بانتظار الدفع.'
  if (message?.includes('invalid_proof')) return 'بيانات الإيصال غير صحيحة.'
  if (message?.includes('invalid_payment_method')) return 'وسيلة الدفع لم تعد متاحة لهذا الطلب.'
  if (message?.includes('payment_proof_intent_unavailable')) return 'انتهت صلاحية محاولة الرفع — اختاري الملف من جديد.'
  return GENERIC_ERROR
}

type PaymentMethod = 'instapay' | 'wallet' | 'bank_transfer'
type PaymentProofStart = { bucket: string; path: string; token: string; intentId: string; expiresAt: string }

function paymentProofExtension(type: string) {
  if (type === 'image/png') return 'png'
  if (type === 'image/webp') return 'webp'
  if (type === 'image/jpeg') return 'jpg'
  return null
}

function paymentProofInputError(input: { orderId: string; method: string; type: string; size: number }) {
  if (!input.orderId || !['instapay', 'wallet', 'bank_transfer'].includes(input.method)) return 'بيانات الدفع غير صحيحة.'
  if (input.size <= 0) return 'أرفقي صورة الإيصال أولًا.'
  if (input.size > 5 * 1024 * 1024) return 'حجم الصورة يتجاوز ٥ ميجابايت.'
  if (!paymentProofExtension(input.type)) return 'الصيغ المقبولة: JPG أو PNG أو WebP.'
  return null
}

export async function beginPaymentProofUpload(input: { orderId: string; method: PaymentMethod; name: string; type: string; size: number; requestId: string }): Promise<ActionResult<PaymentProofStart>> {
  if (!hasEnv()) return { ok: false, error: NO_ENV_ERROR }
  const supabase = await getServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'سجّلي دخولك أولًا.' }
  const rl = await rateLimit('payment_proof', 5, 10 * 60)
  if (!rl.allowed) return { ok: false, error: RATE_LIMIT_MSG }
  const invalid = paymentProofInputError(input)
  if (invalid) return { ok: false, error: invalid }
  if (!paymentProofExtension(input.type)) return { ok: false, error: 'الصيغ المقبولة: JPG أو PNG أو WebP.' }
  const service = getServiceClient()
  const { data: intent, error: intentError } = await service.rpc('begin_payment_proof_upload_intent', {
    p_actor_id: user.id,
    p_order_id: input.orderId,
    p_method: input.method,
    p_declared_mime: input.type.toLowerCase(),
    p_declared_size: input.size,
    p_request_id: input.requestId,
  })
  if (intentError || !intent?.intentId || !intent?.storagePath) return { ok: false, error: proofError(intentError?.message) }
  const path = String(intent.storagePath)
  const { data, error } = await service.storage.from('payment-proofs').createSignedUploadUrl(path)
  if (error || !data) return { ok: false, error: GENERIC_ERROR }
  return {
    ok: true,
    data: {
      bucket: 'payment-proofs', path, token: data.token,
      intentId: String(intent.intentId), expiresAt: String(intent.expiresAt),
    },
  }
}

export async function finalizePaymentProofUpload(input: { orderId: string; method: PaymentMethod; path: string; intentId: string; type: string; size: number }): Promise<ActionResult<{ paymentId: string }>> {
  if (!hasEnv()) return { ok: false, error: NO_ENV_ERROR }
  const supabase = await getServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'سجّلي دخولك أولًا.' }
  const service = getServiceClient()
  const { data: authorized, error: authorizationError } = await service.rpc('authorize_payment_proof_upload_finalization', {
    p_actor_id: user.id,
    p_intent_id: input.intentId,
    p_storage_path: input.path,
  })
  if (authorizationError || !authorized?.authorized || String(authorized.orderId) !== input.orderId || String(authorized.method) !== input.method) {
    return { ok: false, error: 'بيانات الإيصال غير صحيحة.' }
  }
  const declaredMime = String(authorized.declaredMime)
  const declaredSize = Number(authorized.declaredSize)
  if (input.type.toLowerCase() !== declaredMime || input.size !== declaredSize || paymentProofInputError({ ...input, type: declaredMime, size: declaredSize })) {
    return { ok: false, error: 'بيانات الإيصال غير صحيحة.' }
  }
  const inspected = authorized.status === 'issued' && authorized.expired !== true
    ? await inspectStoredObject(service.storage, 'payment-proofs', input.path)
    : null
  const valid = validateObservedPaymentProof({ declaredMime, declaredSize, observed: inspected })
  const { data, error } = await service.rpc('complete_payment_proof_upload_intent', {
    p_actor_id: user.id,
    p_intent_id: input.intentId,
    p_storage_path: input.path,
    p_observed_mime: inspected?.mime ?? null,
    p_observed_size: inspected?.size ?? null,
    p_magic_valid: valid,
  })
  if (error || !data) {
    await service.storage.from('payment-proofs').remove([input.path])
    return { ok: false, error: proofError(error?.message) }
  }
  if (data.removeObject === true) await service.storage.from('payment-proofs').remove([input.path])
  if (!['submitted', 'existing'].includes(String(data.outcome)) || !data.paymentId) {
    return { ok: false, error: valid ? 'انتهت صلاحية محاولة الرفع — اختاري الملف من جديد.' : 'رُفض الملف لأن محتواه الفعلي لا يطابق صورة آمنة.' }
  }
  return { ok: true, data: { paymentId: String(data.paymentId) } }
}
