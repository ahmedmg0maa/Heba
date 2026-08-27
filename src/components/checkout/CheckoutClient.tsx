'use client'

import { useState } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/cn'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { FormField } from '@/components/ui/FormField'
import { formatPrice } from '@/lib/format'
import type { CheckoutProduct, PaymentSettings } from '@/lib/data/checkout'
import { createOrder, validateCoupon, type CreatedOrder } from '@/lib/actions/checkout'
import { uploadPaymentProofDirect } from '@/lib/payment-proof-upload'
import { track } from '@/lib/analytics'

type Method = 'instapay' | 'wallet' | 'bank_transfer'

const allMethods: { id: Method; label: string; hint: string }[] = [
  { id: 'instapay', label: 'إنستاباي', hint: 'تحويل فوري من أي بنك مصري' },
  { id: 'wallet', label: 'محفظة إلكترونية', hint: 'فودافون كاش وغيرها' },
  { id: 'bank_transfer', label: 'تحويل بنكي', hint: 'من حسابك البنكي مباشرة' },
]

function StepDots({ step }: { step: 1 | 2 | 3 }) {
  const labels = ['الطلب والدفع', 'إرفاق الإيصال', 'التأكيد']
  return (
    <ol className="mb-10 flex items-center justify-center gap-2 sm:gap-4">
      {labels.map((label, i) => {
        const n = (i + 1) as 1 | 2 | 3
        const state = n < step ? 'done' : n === step ? 'active' : 'next'
        return (
          <li key={label} className="flex items-center gap-2 sm:gap-4">
            <span className="flex items-center gap-2">
              <span
                className={cn(
                  'tnum flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold',
                  state === 'done' && 'bg-deep-teal text-on-dark',
                  state === 'active' && 'bg-antique-gold text-on-dark',
                  state === 'next' && 'border border-line bg-surface-raised text-taupe',
                )}
              >
                {state === 'done' ? '✓' : n.toLocaleString('ar-EG')}
              </span>
              <span className={cn('hidden text-sm font-semibold sm:block', state === 'active' ? 'text-deep-teal' : 'text-taupe')}>
                {label}
              </span>
            </span>
            {n < 3 && <span className="h-px w-6 bg-line sm:w-10" aria-hidden />}
          </li>
        )
      })}
    </ol>
  )
}

export function CheckoutClient({ product, settings }: { product: CheckoutProduct; settings: PaymentSettings }) {
  // only methods the admin actually configured are offered (§8 — accounts come from site_settings)
  const methods = allMethods.filter((m) =>
    m.id === 'instapay' ? Boolean(settings.instapay) : m.id === 'wallet' ? Boolean(settings.wallet) : Boolean(settings.bank),
  )
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [method, setMethod] = useState<Method>(methods[0]?.id ?? 'instapay')
  const [variantId, setVariantId] = useState(product.variants[0]?.id ?? '')
  const [coupon, setCoupon] = useState<{ code: string; discount: number } | null>(null)
  const [couponMsg, setCouponMsg] = useState<string | null>(null)
  const [order, setOrder] = useState<(CreatedOrder & { hoursLeft: number }) | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [checkoutRequestId, setCheckoutRequestId] = useState<string | null>(null)
  const [freeFulfilled, setFreeFulfilled] = useState(false)

  const selectedVariant = product.variants.find((variant) => variant.id === variantId)
  const selectedPrice = selectedVariant?.price ?? product.price
  const selectedCompareAtPrice = selectedVariant?.compareAtPrice ?? product.compareAtPrice
  const selectedOfferLabel = selectedVariant?.offerLabel ?? product.offerLabel
  const total = Math.max(0, selectedPrice - (coupon?.discount ?? 0))
  const demoMode = product.id === null

  async function onApplyCoupon(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!product.id) return
    const code = String(new FormData(e.currentTarget).get('coupon') ?? '').trim()
    if (!code) return
    setBusy(true)
    setCouponMsg(null)
    const res = await validateCoupon(code, product.id, variantId || undefined)
    if (res.ok) {
      setCoupon({ code: res.data.code, discount: res.data.discount })
      setCouponMsg(`تم تطبيق الكوبون — وفّرتِ ${formatPrice(res.data.discount)}`)
      setCheckoutRequestId(null)
    } else {
      setCoupon(null)
      setCouponMsg(res.error)
      setCheckoutRequestId(null)
    }
    setBusy(false)
  }

  async function onCreateOrder() {
    if (!product.id) {
      setError('إتمام الطلبات غير متاح في بيئة العرض التجريبية.')
      return
    }
    setBusy(true)
    setError(null)
    const requestId = checkoutRequestId ?? crypto.randomUUID()
    if (!checkoutRequestId) setCheckoutRequestId(requestId)
    const res = await createOrder({ productId: product.id, variantId: variantId || undefined, couponCode: coupon?.code, method, requestId })
    if (res.ok) {
      const hoursLeft = Math.round((new Date(res.data.expiresAt).getTime() - Date.now()) / 3_600_000)
      setOrder({ ...res.data, hoursLeft })
      const fulfilledWithoutPayment = res.data.status === 'paid' && res.data.total === 0
      setFreeFulfilled(fulfilledWithoutPayment)
      setStep(fulfilledWithoutPayment ? 3 : 2)
      track('order_created', { product: product.slug, type: product.type, method, total: res.data.total })
    } else {
      setError(res.error)
    }
    setBusy(false)
  }

  async function onSubmitProof(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!order) return
    setBusy(true)
    setError(null)
    const file = new FormData(e.currentTarget).get('proof')
    if (!(file instanceof File)) { setError('أرفقي صورة الإيصال أولًا.'); setBusy(false); return }
    const res = await uploadPaymentProofDirect(order.orderId, method, file)
    if (res.ok) {
      setStep(3)
      track('proof_submitted', { product: product.slug, method })
    } else setError(res.error)
    setBusy(false)
  }

  const instructions: Record<Method, { title: string; rows: { label: string; value: string | undefined }[] }> = {
    instapay: {
      title: 'حوّلي عبر إنستاباي',
      rows: [
        { label: 'العنوان', value: settings.instapay?.handle },
        { label: 'باسم', value: settings.instapay?.name },
        { label: 'المبلغ', value: formatPrice(order?.total ?? total) },
      ],
    },
    wallet: {
      title: 'حوّلي إلى المحفظة',
      rows: [
        { label: 'الرقم', value: settings.wallet?.number },
        { label: 'المحفظة', value: settings.wallet?.provider },
        { label: 'المبلغ', value: formatPrice(order?.total ?? total) },
      ],
    },
    bank_transfer: {
      title: 'حوّلي إلى الحساب البنكي',
      rows: [
        { label: 'البنك', value: settings.bank?.bank },
        { label: 'IBAN', value: settings.bank?.iban },
        { label: 'باسم', value: settings.bank?.name },
        { label: 'المبلغ', value: formatPrice(order?.total ?? total) },
      ],
    },
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-14">
      <StepDots step={step} />

      {step === 1 && (
        <Card className="space-y-6 p-8">
          <div className="flex items-start justify-between gap-4 border-b border-line pb-6">
            <div>
              <p className="text-xs font-semibold tracking-wide text-antique-gold">{product.subtitle}</p>
              <h1 className="mt-1 text-2xl font-bold text-deep-teal">{product.title}</h1>
              {selectedOfferLabel && (
                <span className="mt-2 inline-block rounded-full bg-burgundy/10 px-3 py-1 text-xs font-bold text-burgundy">
                  {selectedOfferLabel}
                </span>
              )}
            </div>
            <div className="text-end">
              <p className="tnum text-2xl font-bold text-burgundy">{formatPrice(total)}</p>
              {(selectedCompareAtPrice || coupon) && (
                <p className="tnum text-sm text-taupe line-through">
                  {formatPrice(selectedCompareAtPrice ?? selectedPrice)}
                </p>
              )}
            </div>
          </div>

          {product.variants.length > 0 && <label className="block text-sm font-bold text-deep-teal">اختاري النسخة<select value={variantId} onChange={(event) => { setVariantId(event.target.value); setCoupon(null); setCouponMsg(null); setCheckoutRequestId(null) }} className="mt-2 min-h-11 w-full rounded-xl border border-line bg-surface-raised px-4 text-ink">{product.variants.map((variant) => <option key={variant.id} value={variant.id}>{variant.name} — {formatPrice(variant.price)}</option>)}</select></label>}

          <form onSubmit={onApplyCoupon} className="flex items-end gap-3">
            <FormField label="كوبون خصم (اختياري)" name="coupon" dir="ltr" className="flex-1" />
            <Button type="submit" variant="secondary" disabled={busy || demoMode}>
              تطبيق
            </Button>
          </form>
          {couponMsg && (
            <p className={cn('text-sm font-medium', coupon ? 'text-deep-teal' : 'text-burgundy')} role="status">
              {couponMsg}
            </p>
          )}

          <fieldset>
            <legend className="mb-3 text-sm font-bold text-deep-teal">اختاري وسيلة الدفع</legend>
            <div className="grid gap-3 sm:grid-cols-3">
              {methods.map((m) => (
                <label
                  key={m.id}
                  className={cn(
                    'cursor-pointer rounded-2xl border p-4 text-center transition-all',
                    method === m.id
                      ? 'border-deep-teal bg-deep-teal/5 shadow-card'
                      : 'border-line bg-surface-raised hover:border-taupe',
                  )}
                >
                  <input
                    type="radio"
                    name="method"
                    value={m.id}
                    checked={method === m.id}
                    onChange={() => { setMethod(m.id); setCheckoutRequestId(null) }}
                    className="sr-only"
                  />
                  <span className="block font-bold text-deep-teal">{m.label}</span>
                  <span className="mt-1 block text-xs text-taupe">{m.hint}</span>
                </label>
              ))}
            </div>
          </fieldset>

          {error && (
            <p className="rounded-xl bg-burgundy/10 px-4 py-3 text-sm font-medium text-burgundy" role="alert">
              {error}
            </p>
          )}

          {methods.length === 0 && total > 0 && <p className="rounded-xl bg-burgundy/10 px-4 py-3 text-sm font-medium text-burgundy" role="status">لا توجد وسيلة دفع يدوية مهيأة حاليًا، لذلك لن ننشئ طلبًا غير قابل للإكمال.</p>}
          <Button size="lg" className="w-full" onClick={onCreateOrder} disabled={busy || (methods.length === 0 && total > 0)}>
            {busy ? 'لحظات…' : 'متابعة لتعليمات الدفع'}
          </Button>
          <p className="text-center text-xs text-taupe">
            بإتمام الطلب فأنتِ توافقين على <Link href="/terms" className="underline">الشروط والأحكام</Link>
          </p>
        </Card>
      )}

      {step === 2 && order && (
        <Card className="space-y-6 p-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-deep-teal">{instructions[method].title}</h1>
            <p className="mt-2 text-sm text-text-soft">
              بعد التحويل صوّري الإيصال وأرفقيه هنا — يراجعه الفريق ضمن أوقات العمل ثم يفعّل وصولك.
            </p>
          </div>

          <dl className="divide-y divide-line rounded-2xl border border-line bg-ivory/60">
            {instructions[method].rows.filter((row) => row.value).map((row) => (
              <div key={row.label} className="flex items-center justify-between gap-4 px-5 py-3.5">
                <dt className="text-sm font-semibold text-taupe">{row.label}</dt>
                <dd dir="ltr" className="tnum font-bold text-deep-teal">
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>

          <Badge tone="pending" className="mx-auto">
            تنتهي صلاحية الطلب خلال {order.hoursLeft.toLocaleString('ar-EG')} ساعة
          </Badge>

          <form onSubmit={onSubmitProof} className="space-y-5">
            <div>
              <label htmlFor="proof" className="mb-2 block text-sm font-bold text-deep-teal">
                صورة إيصال التحويل
              </label>
              <input
                id="proof"
                name="proof"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                required
                className="w-full rounded-xl border border-dashed border-taupe bg-surface-raised px-4 py-6 text-sm text-text-soft file:me-4 file:rounded-full file:border-0 file:bg-deep-teal file:px-5 file:py-2 file:text-sm file:font-semibold file:text-on-dark"
              />
              <p className="mt-2 text-xs text-taupe">JPG أو PNG أو WebP — بحد أقصى ٥ ميجابايت</p>
            </div>
            {error && (
              <p className="rounded-xl bg-burgundy/10 px-4 py-3 text-sm font-medium text-burgundy" role="alert">
                {error}
              </p>
            )}
            <Button type="submit" size="lg" className="w-full" disabled={busy}>
              {busy ? 'جارٍ الرفع…' : 'أرسلي الإيصال للمراجعة'}
            </Button>
          </form>
        </Card>
      )}

      {step === 3 && (
        <Card className="space-y-5 p-10 text-center">
          <svg viewBox="0 0 48 48" className="mx-auto h-16 w-16 text-deep-teal" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <circle cx="24" cy="24" r="21" strokeOpacity="0.3" />
            <path d="M15 25l6 6 12-13" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <h1 className="text-2xl font-bold text-deep-teal">{freeFulfilled ? 'تم تفعيل وصولك' : 'استلمنا إيصالك'}</h1>
          <p className="mx-auto max-w-sm leading-loose text-text-soft">
            {freeFulfilled
              ? 'هذا العنصر مجاني، لذلك اكتمل الطلب وفُعّل الوصول مباشرة من دون طلب تحويل أو إيصال.'
              : 'طلبك الآن قيد المراجعة. سنفعّل وصولك ونرسل لك إشعارًا فور اعتماد الإيصال.'}
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Button href="/dashboard/payments">تابعي حالة الدفع</Button>
            <Button href="/dashboard" variant="secondary">
              لوحتي
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}
