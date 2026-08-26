'use server'

import { getServerClient, getServiceClient, hasSupabaseServerSecret } from '@/lib/supabase/server'
import { rateLimit, RATE_LIMIT_MSG } from '@/lib/rate-limit'
import { hasSupabasePublicConfig } from '@/lib/supabase/public-key'

type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string }
const GENERIC_ERROR = 'حدث خطأ غير متوقع — حاولي مرة أخرى.'
const NO_ENV_ERROR = 'إتمام الطلبات غير متاح في بيئة العرض التجريبية.'
const hasEnv = () => hasSupabasePublicConfig() && hasSupabaseServerSecret()

export type CouponResult = { code: string; discount: number; couponId: string }

export async function validateCoupon(code: string, productId: string, price: number): Promise<ActionResult<CouponResult>> {
  if (!hasEnv()) return { ok: false, error: 'الكوبونات غير متاحة في بيئة العرض.' }
  const supabase = await getServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'سجّلي دخولك أولًا.' }
  const rl = await rateLimit('coupon', 10, 5 * 60)
  if (!rl.allowed) return { ok: false, error: RATE_LIMIT_MSG }
  const service = getServiceClient()
  const { data: product } = await service.from('products').select('id, is_published').eq('id', productId).maybeSingle()
  if (!product?.is_published || !Number.isFinite(price) || price < 0) return { ok: false, error: 'هذا المنتج غير متاح.' }
  const { data: coupon } = await service.from('coupons').select('id, code, kind, value, max_uses, max_uses_per_user, starts_at, ends_at, is_active').eq('code', code.trim().toUpperCase()).maybeSingle()
  const invalid = { ok: false as const, error: 'هذا الكوبون غير صالح أو منتهي.' }
  if (!coupon?.is_active) return invalid
  const now = Date.now()
  if ((coupon.starts_at && new Date(coupon.starts_at).getTime() > now) || (coupon.ends_at && new Date(coupon.ends_at).getTime() < now)) return invalid
  const [{ count: totalUses }, { count: userUses }] = await Promise.all([
    service.from('coupon_redemptions').select('id', { count: 'exact', head: true }).eq('coupon_id', coupon.id),
    service.from('coupon_redemptions').select('id', { count: 'exact', head: true }).eq('coupon_id', coupon.id).eq('user_id', user.id),
  ])
  if (coupon.max_uses !== null && (totalUses ?? 0) >= coupon.max_uses) return { ok: false, error: 'اكتمل الحد الأقصى لاستخدام هذا الكوبون.' }
  if ((userUses ?? 0) >= coupon.max_uses_per_user) return { ok: false, error: 'استخدمتِ هذا الكوبون من قبل.' }
  const discount = coupon.kind === 'percent' ? Math.round(price * (Number(coupon.value) / 100) * 100) / 100 : Math.min(Number(coupon.value), price)
  return { ok: true, data: { code: coupon.code, discount, couponId: coupon.id } }
}

export type CreatedOrder = { orderId: string; total: number; expiresAt: string }

function checkoutError(message?: string) {
  if (message?.includes('product_unavailable')) return 'هذا المنتج غير متاح.'
  if (message?.includes('coupon_invalid')) return 'هذا الكوبون غير صالح أو منتهي.'
  if (message?.includes('coupon_exhausted')) return 'اكتمل الحد الأقصى لاستخدام هذا الكوبون.'
  if (message?.includes('coupon_user_limit')) return 'استخدمتِ هذا الكوبون من قبل.'
  if (message?.includes('invalid_payment_method')) return 'وسيلة الدفع غير متاحة.'
  return GENERIC_ERROR
}

export async function createOrder(input: { productId: string; variantId?: string; couponCode?: string; method: 'instapay' | 'wallet' | 'bank_transfer' }): Promise<ActionResult<CreatedOrder>> {
  if (!hasEnv()) return { ok: false, error: NO_ENV_ERROR }
  const supabase = await getServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'سجّلي دخولك أولًا.' }
  const { data, error } = await supabase.rpc('create_product_order_v2', { p_product_id: input.productId, p_variant_id: input.variantId ?? null, p_coupon_code: input.couponCode ?? '', p_method: input.method })
  if (error || !data) return { ok: false, error: checkoutError(error?.message) }
  return { ok: true, data: { orderId: String(data.order_id), total: Number(data.total), expiresAt: String(data.expires_at) } }
}

function proofError(message?: string) {
  if (message?.includes('order_not_found')) return 'الطلب غير موجود.'
  if (message?.includes('order_expired')) return 'انتهت صلاحية هذا الطلب — أنشئي طلبًا جديدًا.'
  if (message?.includes('order_not_pending')) return 'هذا الطلب ليس بانتظار الدفع.'
  if (message?.includes('invalid_proof')) return 'بيانات الإيصال غير صحيحة.'
  return GENERIC_ERROR
}

type PaymentMethod = 'instapay' | 'wallet' | 'bank_transfer'
type PaymentProofStart = { bucket: string; path: string; token: string }

function paymentProofExtension(type: string) {
  if (type === 'image/png') return 'png'
  if (type === 'image/webp') return 'webp'
  if (type === 'image/jpeg' || type === 'image/jpg') return 'jpg'
  return null
}

function paymentProofInputError(input: { orderId: string; method: string; type: string; size: number }) {
  if (!input.orderId || !['instapay', 'wallet', 'bank_transfer'].includes(input.method)) return 'بيانات الدفع غير صحيحة.'
  if (input.size <= 0) return 'أرفقي صورة الإيصال أولًا.'
  if (input.size > 5 * 1024 * 1024) return 'حجم الصورة يتجاوز ٥ ميجابايت.'
  if (!paymentProofExtension(input.type)) return 'الصيغ المقبولة: JPG أو PNG أو WebP.'
  return null
}

export async function beginPaymentProofUpload(input: { orderId: string; method: PaymentMethod; name: string; type: string; size: number }): Promise<ActionResult<PaymentProofStart>> {
  if (!hasEnv()) return { ok: false, error: NO_ENV_ERROR }
  const supabase = await getServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'سجّلي دخولك أولًا.' }
  const rl = await rateLimit('payment_proof', 5, 10 * 60)
  if (!rl.allowed) return { ok: false, error: RATE_LIMIT_MSG }
  const invalid = paymentProofInputError(input)
  if (invalid) return { ok: false, error: invalid }
  const ext = paymentProofExtension(input.type)
  if (!ext) return { ok: false, error: 'الصيغ المقبولة: JPG أو PNG أو WebP.' }
  const path = `${user.id}/${input.orderId}/${crypto.randomUUID()}.${ext}`
  const service = getServiceClient()
  const { data, error } = await service.storage.from('payment-proofs').createSignedUploadUrl(path)
  if (error || !data) return { ok: false, error: GENERIC_ERROR }
  return { ok: true, data: { bucket: 'payment-proofs', path, token: data.token } }
}

export async function finalizePaymentProofUpload(input: { orderId: string; method: PaymentMethod; path: string }): Promise<ActionResult<{ paymentId: string }>> {
  if (!hasEnv()) return { ok: false, error: NO_ENV_ERROR }
  const supabase = await getServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'سجّلي دخولك أولًا.' }
  const allowedPath = new RegExp(`^${user.id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/${input.orderId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/[0-9a-f-]{36}\\.(png|jpg|webp)$`, 'i')
  if (paymentProofInputError({ ...input, type: input.path.endsWith('.png') ? 'image/png' : input.path.endsWith('.webp') ? 'image/webp' : 'image/jpeg', size: 1 }) || !allowedPath.test(input.path)) return { ok: false, error: 'بيانات الإيصال غير صحيحة.' }
  const service = getServiceClient()
  const { data, error } = await supabase.rpc('submit_payment_proof_atomic', { p_order_id: input.orderId, p_method: input.method, p_storage_path: input.path })
  if (error || !data) {
    await service.storage.from('payment-proofs').remove([input.path])
    return { ok: false, error: proofError(error?.message) }
  }
  if (data.outcome === 'existing') await service.storage.from('payment-proofs').remove([input.path])
  return { ok: true, data: { paymentId: String(data.payment_id) } }
}
