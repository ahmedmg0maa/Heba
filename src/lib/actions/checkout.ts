'use server'

import { getServerClient, getServiceClient } from '@/lib/supabase/server'
import { getPaymentSettings, resolveActiveOffer, applyOffer } from '@/lib/data/checkout'
import { rateLimit, RATE_LIMIT_MSG } from '@/lib/rate-limit'

type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string }

const GENERIC_ERROR = 'حدث خطأ غير متوقع — حاولي مرة أخرى.'
const NO_ENV_ERROR = 'إتمام الطلبات غير متاح في بيئة العرض التجريبية.'

const hasEnv = () =>
  Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
      process.env.SUPABASE_SERVICE_ROLE_KEY,
  )

async function writeAudit(actorId: string, action: string, entityType: string, entityId: string, meta: object = {}) {
  try {
    await getServiceClient().from('audit_logs').insert({
      actor_id: actorId,
      action,
      entity_type: entityType,
      entity_id: entityId,
      meta,
    })
  } catch {
    // Audit failures must never block the customer flow; system_events picks these up later.
  }
}

export type CouponResult = { code: string; discount: number; couponId: string }

export async function validateCoupon(code: string, productId: string, price: number): Promise<ActionResult<CouponResult>> {
  if (!hasEnv()) return { ok: false, error: 'الكوبونات غير متاحة في بيئة العرض.' }
  const supabase = await getServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'سجّلي دخولك أولًا.' }

  // 10 coupon attempts per 5 minutes per user — codes are not guessable in bulk.
  const rl = rateLimit(`coupon:${user.id}`, 10, 5 * 60_000)
  if (!rl.allowed) return { ok: false, error: RATE_LIMIT_MSG }

  // Coupons are not readable under RLS by design — validate with the service client.
  const service = getServiceClient()
  const { data: coupon } = await service
    .from('coupons')
    .select('id, code, kind, value, max_uses, max_uses_per_user, starts_at, ends_at, is_active')
    .eq('code', code.trim().toUpperCase())
    .maybeSingle()

  const invalid = { ok: false as const, error: 'هذا الكوبون غير صالح أو منتهي.' }
  if (!coupon || !coupon.is_active) return invalid
  const now = Date.now()
  if (coupon.starts_at && new Date(coupon.starts_at).getTime() > now) return invalid
  if (coupon.ends_at && new Date(coupon.ends_at).getTime() < now) return invalid

  const { count: totalUses } = await service
    .from('coupon_redemptions')
    .select('id', { count: 'exact', head: true })
    .eq('coupon_id', coupon.id)
  if (coupon.max_uses !== null && (totalUses ?? 0) >= coupon.max_uses)
    return { ok: false, error: 'اكتمل الحد الأقصى لاستخدام هذا الكوبون.' }

  const { count: userUses } = await service
    .from('coupon_redemptions')
    .select('id', { count: 'exact', head: true })
    .eq('coupon_id', coupon.id)
    .eq('user_id', user.id)
  if ((userUses ?? 0) >= coupon.max_uses_per_user)
    return { ok: false, error: 'استخدمتِ هذا الكوبون من قبل.' }

  const discount =
    coupon.kind === 'percent'
      ? Math.round(price * (Number(coupon.value) / 100) * 100) / 100
      : Math.min(Number(coupon.value), price)

  return { ok: true, data: { code: coupon.code, discount, couponId: coupon.id } }
}

export type CreatedOrder = { orderId: string; total: number; expiresAt: string }

export async function createOrder(input: {
  productId: string
  couponCode?: string
  method: 'instapay' | 'wallet' | 'bank_transfer'
}): Promise<ActionResult<CreatedOrder>> {
  if (!hasEnv()) return { ok: false, error: NO_ENV_ERROR }
  const supabase = await getServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'سجّلي دخولك أولًا.' }

  // Server-trusted price lookup — never trust client totals.
  const { data: product } = await supabase
    .from('products')
    .select('id, type, title, price, currency, is_published')
    .eq('id', input.productId)
    .maybeSingle()
  if (!product || !product.is_published) return { ok: false, error: 'هذا المنتج غير متاح.' }

  // Same offer resolution the checkout page used — recomputed here so the client can't tamper.
  const listPrice = Number(product.price)
  const offer = await resolveActiveOffer(product.id, product.type)
  const price = applyOffer(listPrice, offer)

  let discount = 0
  let couponId: string | null = null
  if (input.couponCode) {
    const res = await validateCoupon(input.couponCode, product.id, price)
    if (!res.ok) return res
    discount = res.data.discount
    couponId = res.data.couponId
  }
  const total = Math.max(0, price - discount)

  const settings = await getPaymentSettings()
  const expiresAt = new Date(Date.now() + settings.expiryHours * 3_600_000).toISOString()

  const { data: order, error: orderErr } = await supabase
    .from('orders')
    .insert({
      user_id: user.id,
      status: 'pending_payment',
      subtotal: listPrice,
      discount: listPrice - price + discount, // offer discount + coupon discount
      total,
      currency: product.currency,
      coupon_id: couponId,
      offer_id: offer?.id ?? null,
      expires_at: expiresAt,
    })
    .select('id')
    .single()
  if (orderErr || !order) return { ok: false, error: GENERIC_ERROR }

  const { error: itemErr } = await supabase.from('order_items').insert({
    order_id: order.id,
    product_id: product.id,
    quantity: 1,
    unit_price: price,
    total,
  })
  if (itemErr) return { ok: false, error: GENERIC_ERROR }

  await writeAudit(user.id, 'order.created', 'order', order.id, {
    product_id: product.id,
    method: input.method,
    total,
    coupon_id: couponId,
  })

  return { ok: true, data: { orderId: order.id, total, expiresAt } }
}

export async function submitPaymentProof(formData: FormData): Promise<ActionResult<{ paymentId: string }>> {
  if (!hasEnv()) return { ok: false, error: NO_ENV_ERROR }
  const supabase = await getServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'سجّلي دخولك أولًا.' }

  // 5 proof uploads per 10 minutes per user
  const rl = rateLimit(`proof:${user.id}`, 5, 10 * 60_000)
  if (!rl.allowed) return { ok: false, error: RATE_LIMIT_MSG }

  const orderId = String(formData.get('orderId') ?? '')
  const method = String(formData.get('method') ?? '') as 'instapay' | 'wallet' | 'bank_transfer'
  const file = formData.get('proof')
  if (!orderId || !(file instanceof File) || file.size === 0)
    return { ok: false, error: 'أرفقي صورة الإيصال أولًا.' }
  if (file.size > 5 * 1024 * 1024) return { ok: false, error: 'حجم الصورة يتجاوز ٥ ميجابايت.' }
  if (!/^image\/(png|jpe?g|webp)$/.test(file.type))
    return { ok: false, error: 'الصيغ المقبولة: JPG أو PNG أو WebP.' }

  // Ownership + state check under the user's own RLS context.
  const { data: order } = await supabase
    .from('orders')
    .select('id, status, total, expires_at')
    .eq('id', orderId)
    .maybeSingle()
  if (!order) return { ok: false, error: 'الطلب غير موجود.' }
  if (order.expires_at && new Date(order.expires_at).getTime() < Date.now())
    return { ok: false, error: 'انتهت صلاحية هذا الطلب — أنشئي طلبًا جديدًا.' }
  if (order.status !== 'pending_payment')
    return { ok: false, error: 'هذا الطلب ليس بانتظار الدفع.' }

  const service = getServiceClient()
  const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg'
  const path = `${user.id}/${orderId}/${Date.now()}.${ext}`

  const { error: uploadErr } = await service.storage
    .from('payment-proofs')
    .upload(path, Buffer.from(await file.arrayBuffer()), { contentType: file.type })
  if (uploadErr) return { ok: false, error: GENERIC_ERROR }

  const { data: payment, error: payErr } = await supabase
    .from('payments')
    .insert({ order_id: orderId, user_id: user.id, method, amount: order.total, status: 'pending' })
    .select('id')
    .single()
  if (payErr || !payment) return { ok: false, error: GENERIC_ERROR }

  const { error: proofErr } = await supabase
    .from('payment_proofs')
    .insert({ payment_id: payment.id, storage_path: path, uploaded_by: user.id })
  if (proofErr) return { ok: false, error: GENERIC_ERROR }

  // Status transition is admin-gated under RLS — the service client performs it
  // only after the ownership checks above.
  const { error: statusErr } = await service
    .from('orders')
    .update({ status: 'awaiting_review' })
    .eq('id', orderId)
    .eq('user_id', user.id)
    .eq('status', 'pending_payment')
  if (statusErr) return { ok: false, error: GENERIC_ERROR }

  await writeAudit(user.id, 'payment.proof_submitted', 'payment', payment.id, {
    order_id: orderId,
    method,
    storage_path: path,
  })

  return { ok: true, data: { paymentId: payment.id } }
}
