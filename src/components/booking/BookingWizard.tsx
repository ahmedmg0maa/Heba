'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { completeBookingFromHold, createBookingHold, releaseBookingHold } from '@/lib/actions/booking'
import { uploadPaymentProofDirect } from '@/lib/payment-proof-upload'
import type { BookingExperience, BookingService } from '@/lib/data/booking'
import { formatPrice } from '@/lib/format'
import { cn } from '@/lib/cn'
import { Button } from '@/components/ui/Button'
import { FormField, FormTextarea } from '@/components/ui/FormField'

type PaymentMethod = 'instapay' | 'wallet' | 'bank_transfer'

const steps = [
  ['نوع الجلسة', 'اختاري المساحة المناسبة'],
  ['التاريخ', 'اليوم الأنسب لكِ'],
  ['الوقت', 'موعد واضح ومتاح'],
  ['البيانات', 'للتواصل والتأكيد'],
  ['مراجعة', 'راجعي تفاصيل الموعد'],
  ['الدفع', 'إرسال الإيصال للمراجعة'],
] as const

const dateFormatter = new Intl.DateTimeFormat('ar-EG', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  timeZone: 'Africa/Cairo',
})
const longDateFormatter = new Intl.DateTimeFormat('ar-EG', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  timeZone: 'Africa/Cairo',
})

function toMinutes(value: string) {
  const [hours, mins] = value.slice(0, 5).split(':').map(Number)
  return hours * 60 + mins
}

function timeLabel(value: string) {
  const [hours, mins] = value.split(':').map(Number)
  const date = new Date(Date.UTC(2020, 0, 1, hours, mins))
  return new Intl.DateTimeFormat('ar-EG', { hour: 'numeric', minute: '2-digit', timeZone: 'UTC' }).format(date)
}

function availableDate(service: BookingService, date: string) {
  return (service.availableSlots[date] ?? []).length > 0
}

export function BookingWizard({ experience }: { experience: BookingExperience }) {
  const [step, setStep] = useState(0)
  const [serviceId, setServiceId] = useState(experience.services[0]?.id ?? '')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [notes, setNotes] = useState('')
  const [subscriptionId, setSubscriptionId] = useState('')
  const [method, setMethod] = useState<PaymentMethod>(
    experience.paymentSettings.instapay ? 'instapay' : experience.paymentSettings.wallet ? 'wallet' : 'bank_transfer',
  )
  const [order, setOrder] = useState<{ orderId: string; total: number } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [complete, setComplete] = useState(false)
  const [packageComplete, setPackageComplete] = useState(false)
  const [hold, setHold] = useState<{ id: string; expiresAt: string } | null>(null)
  const [now, setNow] = useState(0)

  const service = experience.services.find((item) => item.id === serviceId) ?? experience.services[0]
  const slots = useMemo(() => (service && date ? service.availableSlots[date] ?? [] : []), [service, date])
  const eligibleCredits = experience.credits.filter((credit) => service?.id && credit.eligibleServiceIds.includes(service.id))
  const paymentMethods = [
    experience.paymentSettings.instapay && { id: 'instapay' as const, label: 'InstaPay', detail: experience.paymentSettings.instapay.handle },
    experience.paymentSettings.wallet && { id: 'wallet' as const, label: experience.paymentSettings.wallet.provider, detail: experience.paymentSettings.wallet.number },
    experience.paymentSettings.bank && { id: 'bank_transfer' as const, label: 'تحويل بنكي', detail: experience.paymentSettings.bank.iban },
  ].filter(Boolean) as { id: PaymentMethod; label: string; detail: string }[]
  const canCreateBooking = service?.paymentMode === 'free' || paymentMethods.length > 0 || eligibleCredits.length > 0
  const secondsRemaining = hold ? Math.max(0, Math.ceil((new Date(hold.expiresAt).getTime() - now) / 1_000)) : 0

  useEffect(() => {
    if (!hold) return
    const timer = window.setInterval(() => setNow(Date.now()), 1_000)
    return () => window.clearInterval(timer)
  }, [hold])

  function chooseService(item: BookingService) {
    if (hold) void releaseBookingHold(hold.id)
    setHold(null)
    setServiceId(item.id ?? '')
    setDate('')
    setTime('')
    setOrder(null)
  }

  function validateCurrent() {
    if (step === 0 && !service?.id) return 'اختاري جلسة متاحة.'
    if (step === 1 && !date) return 'اختاري تاريخ الجلسة.'
    if (step === 2 && !time) return 'اختاري وقت الجلسة.'
    if (step === 3 && (fullName.trim().length < 2 || !/^\+?[0-9\s-]{8,18}$/.test(phone.trim())))
      return 'راجعي الاسم ورقم الهاتف قبل المتابعة.'
    return null
  }

  async function next() {
    const validation = validateCurrent()
    if (validation) {
      setError(validation)
      return
    }
    setError(null)
    if (step < 3) {
      setStep((value) => value + 1)
      return
    }
    if (step === 3) {
      if (!service?.id) return
      setLoading(true)
      const result = await createBookingHold({ serviceId: service.id, date, time })
      setLoading(false)
      if (!result.ok) {
        setError(result.error)
        if (result.code === 'SLOT_TAKEN') { setTime(''); setStep(2) }
        return
      }
      setHold({ id: result.data.holdId, expiresAt: result.data.expiresAt })
      setNow(Date.now())
      setStep(4)
      return
    }
    if (!service?.id || order || complete) {
      setStep(5)
      return
    }
    if (!canCreateBooking) {
      setError('فعّلي وسيلة دفع لهذه الخدمة، أو انشريها كحجز مجاني، أو استخدمي رصيد باقة مستحق.')
      return
    }
    setLoading(true)
    if (!hold || secondsRemaining <= 0) {
      setError('انتهت مهلة تثبيت الموعد. اختاري الوقت مرة أخرى.')
      setHold(null); setTime(''); setStep(2)
      return
    }
    const bookingInput = { serviceId: service.id, date, time, fullName, phone, notes, subscriptionId: subscriptionId || undefined }
    const result = await completeBookingFromHold(bookingInput, hold.id, service.paymentMode === 'free')
    setLoading(false)
    if (!result.ok) {
      setError(result.error)
      if (result.code === 'SLOT_TAKEN') {
        setTime('')
        setStep(2)
      }
      return
    }
    setHold(null)
    setOrder(result.data.orderId ? { orderId: result.data.orderId, total: result.data.total } : null)
    if (result.data.packageBacked || result.data.confirmed) { setPackageComplete(Boolean(result.data.packageBacked)); setComplete(true) } else setStep(5)
  }

  async function submitProof(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!order) return
    setLoading(true)
    setError(null)
    const file = new FormData(event.currentTarget).get('proof')
    if (!(file instanceof File)) { setLoading(false); setError('أرفقي صورة الإيصال أولًا.'); return }
    const result = await uploadPaymentProofDirect(order.orderId, method, file)
    setLoading(false)
    if (!result.ok) {
      setError(result.error)
      return
    }
    setComplete(true)
  }

  if (!service) {
    return (
      <div className="rounded-3xl border border-dashed border-line bg-surface-raised px-6 py-16 text-center">
        <h2 className="text-2xl font-bold text-deep-teal">{experience.runtime.status === 'migration-required' ? 'الحجز غير متاح حاليًا' : 'لا توجد جلسات مفتوحة للحجز الآن'}</h2>
        <p className="mt-2 text-text-soft">{experience.runtime.status === 'migration-required' ? 'يُستكمل إعداد الحجز قبل نشر أي موعد للعميلات.' : 'تظهر الجلسات هنا عند نشر خدمة وربطها بقواعد توافر فعلية من لوحة الإدارة.'}</p>
        <Button href="/services" variant="secondary" className="mt-6">استكشفي المسارات</Button>
      </div>
    )
  }

  if (complete) {
    return (
      <div className="mx-auto max-w-2xl rounded-3xl border border-antique-gold/40 bg-surface-raised p-8 text-center shadow-card sm:p-12">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-deep-teal text-2xl text-on-dark">✓</span>
        <h2 className="mt-5 text-3xl font-bold text-deep-teal">وصل طلب حجزك بنجاح</h2>
        <p className="mt-3 leading-relaxed text-text-soft">{packageComplete ? 'استُخدمت جلسة من رصيدك المستحق وثُبّت الطلب دون حاجة إلى إثبات دفع.' : 'طلبك قيد المراجعة؛ تظهر حالة الجلسة داخل حسابك عند تحديثها.'}</p>
        <Button href="/dashboard/bookings" className="mt-6">متابعة حجوزاتي</Button>
      </div>
    )
  }

  return (
    <div className="space-y-7">
      <ol className="grid gap-2 sm:grid-cols-6" aria-label="خطوات الحجز">
        {steps.map(([title, subtitle], index) => (
          <li key={title}>
            <button
              type="button"
              disabled={index > step || Boolean(order)}
              onClick={() => { if (index < step) { if (hold && index < 4) { void releaseBookingHold(hold.id); setHold(null) }; setStep(index) } }}
              className={cn(
                'flex min-h-20 w-full items-center gap-3 rounded-2xl border px-3 text-start transition-colors sm:block sm:text-center',
                index === step ? 'border-antique-gold bg-surface-raised shadow-card' : index < step ? 'border-deep-teal/20 bg-deep-teal/5' : 'border-line bg-ivory/40 opacity-65',
              )}
            >
              <span className={cn('tnum inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold', index <= step ? 'bg-deep-teal text-on-dark' : 'bg-sand/60 text-taupe')}>
                {index < step ? '✓' : (index + 1).toLocaleString('ar-EG')}
              </span>
              <span className="mt-2 block">
                <strong className="block text-sm text-deep-teal">{title}</strong>
              <span className="hidden text-[11px] text-taupe xl:block">{subtitle}</span>
              </span>
            </button>
          </li>
        ))}
      </ol>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section className="rounded-3xl border border-line bg-surface-raised p-5 shadow-card sm:p-8">
          <p className="text-sm font-bold text-antique-gold">الخطوة {(step + 1).toLocaleString('ar-EG')}</p>

          {step === 0 && (
            <div className="mt-3">
              <h2 className="text-3xl font-bold text-deep-teal">اختاري نوع الجلسة</h2>
              <p className="mt-1 text-text-soft">اختاري المساحة الأقرب لاحتياجك الحالي؛ يمكنك الرجوع قبل الدفع.</p>
              <div className="mt-6 grid gap-4">
                {experience.services.map((item) => (
                  <button
                    key={item.slug}
                    type="button"
                    onClick={() => chooseService(item)}
                    className={cn('rounded-2xl border p-5 text-start transition-all', item.id === service.id ? 'border-antique-gold bg-antique-gold/5 shadow-card' : 'border-line hover:border-deep-teal/30')}
                  >
                    <span className="text-xs font-bold text-burgundy">{item.paymentMode === 'free' ? 'حجز مجاني' : 'خدمة منشورة'}</span>
                    <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-deep-teal">{item.title}</h3>
                        <p className="mt-1 max-w-xl text-sm leading-relaxed text-text-soft">{item.description}</p>
                      </div>
                      <div className="shrink-0 text-start sm:text-end">
                        <strong className="tnum block text-xl text-burgundy">{formatPrice(item.price, item.currency)}</strong>
                        <span className="text-xs text-taupe">{item.durationMinutes.toLocaleString('ar-EG')} دقيقة</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="mt-3">
              <h2 className="text-3xl font-bold text-deep-teal">اختاري تاريخ الجلسة</h2>
              <p className="mt-1 text-text-soft">تعكس الأيام المعروضة نافذة الحجز المنشورة حاليًا حسب توقيت القاهرة.</p>
              <div className="mt-6 grid grid-cols-3 gap-2 sm:grid-cols-5 md:grid-cols-7">
                {experience.calendarDates.map((item) => {
                  const enabled = availableDate(service, item)
                  return (
                    <button
                      key={item}
                      type="button"
                      disabled={!enabled}
                      onClick={() => { setDate(item); setTime('') }}
                      className={cn('min-h-20 rounded-2xl border px-2 py-3 text-center transition-all', date === item ? 'border-antique-gold bg-antique-gold/10 shadow-card' : enabled ? 'border-line hover:border-deep-teal/40' : 'border-line bg-sand/15 text-taupe opacity-45')}
                    >
                      <span className="block text-sm font-bold">{dateFormatter.format(new Date(`${item}T12:00:00Z`))}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="mt-3">
              <h2 className="text-3xl font-bold text-deep-teal">اختاري وقت الجلسة</h2>
              <p className="mt-1 text-text-soft">تعكس الأوقات المعروضة التوافر الحالي حسب توقيت القاهرة، ويُعاد التحقق عند إنشاء الطلب.</p>
              {slots.length === 0 ? (
                <div className="mt-6 rounded-2xl bg-ivory p-6 text-center text-text-soft">لا توجد أوقات متاحة في هذا اليوم؛ اختاري تاريخًا آخر.</div>
              ) : (
                <div className="mt-6 space-y-5">
                  {[
                    ['الصباح', slots.filter((slot) => toMinutes(slot) < 12 * 60)],
                    ['بعد الظهر', slots.filter((slot) => toMinutes(slot) >= 12 * 60 && toMinutes(slot) < 17 * 60)],
                    ['المساء', slots.filter((slot) => toMinutes(slot) >= 17 * 60)],
                  ].filter(([, values]) => (values as string[]).length > 0).map(([label, values]) => (
                    <div key={label as string}>
                      <h3 className="mb-2 font-bold text-deep-teal">{label as string}</h3>
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                        {(values as string[]).map((slot) => (
                          <button key={slot} type="button" onClick={() => setTime(slot)} className={cn('tnum min-h-12 rounded-xl border px-3 font-semibold transition-colors', time === slot ? 'border-deep-teal bg-deep-teal text-on-dark' : 'border-line hover:border-deep-teal/40')}>
                            {timeLabel(slot)}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="mt-3">
              <h2 className="text-3xl font-bold text-deep-teal">بيانات التواصل</h2>
              <p className="mt-1 text-text-soft">تُرسل هذه البيانات مع طلب الحجز. راجعي سياسة الخصوصية المعتمدة عند نشرها قبل استخدام بيئة إنتاج.</p>
              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <FormField label="الاسم الكامل" name="full_name" required value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="اكتبي اسمك" />
                <FormField label="رقم الهاتف" name="phone" type="tel" required dir="ltr" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="01xxxxxxxxx" />
                <FormTextarea className="sm:col-span-2" label="سؤال أو ملاحظة قبل الجلسة" name="notes" value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="ما الذي تريدين فهمه أو ترتيبه؟" />
              </div>
              <p className="mt-4 rounded-xl bg-ivory px-4 py-3 text-sm text-text-soft">قد يُطلب تسجيل الدخول عند تثبيت الموعد حتى يُربط الطلب بحسابك.</p>
              {eligibleCredits.length > 0 && <fieldset className="mt-5 rounded-2xl border border-antique-gold/35 bg-antique-gold/5 p-4"><legend className="px-2 text-sm font-bold text-deep-teal">استخدام باقة جلسات (اختياري)</legend><label className="block text-sm text-text-soft">اختاري باقة أو اتركي الدفع العادي<select value={subscriptionId} onChange={(event)=>setSubscriptionId(event.target.value)} className="mt-2 min-h-11 w-full rounded-xl border border-line bg-surface-raised px-4 text-ink"><option value="">الدفع لهذه الجلسة</option>{eligibleCredits.map((credit)=><option key={credit.subscriptionId} value={credit.subscriptionId}>{credit.planTitle} — {credit.balance.toLocaleString('ar-EG')} جلسة متبقية</option>)}</select></label></fieldset>}
            </div>
          )}

          {step === 4 && (
            <div className="mt-3">
              <h2 className="text-3xl font-bold text-deep-teal">راجعي الحجز قبل تثبيته</h2>
              {hold && <p className={cn('mt-4 rounded-xl px-4 py-3 text-sm font-bold', secondsRemaining > 0 ? 'bg-aqua/10 text-deep-teal' : 'bg-burgundy/10 text-burgundy')}>تم تثبيت الموعد مؤقتًا لمدة {Math.floor(secondsRemaining / 60).toLocaleString('ar-EG')}:{String(secondsRemaining % 60).padStart(2, '0')} دقيقة. ينتهي الحجز المؤقت تلقائيًا إن لم يكتمل التأكيد.</p>}
              <dl className="mt-6 grid gap-3 rounded-2xl bg-ivory p-5 text-sm sm:grid-cols-2"><div><dt className="text-text-soft">الخدمة</dt><dd className="mt-1 font-bold text-deep-teal">{service.title}</dd></div><div><dt className="text-text-soft">الموعد بتوقيت القاهرة</dt><dd className="mt-1 font-bold text-deep-teal">{date ? longDateFormatter.format(new Date(`${date}T12:00:00Z`)) : ''} — {time ? timeLabel(time) : ''}</dd></div><div><dt className="text-text-soft">التواصل</dt><dd className="mt-1 font-bold text-deep-teal">{fullName} · <span dir="ltr">{phone}</span></dd></div><div><dt className="text-text-soft">آلية الحجز</dt><dd className="mt-1 font-bold text-deep-teal">{service.paymentMode === 'free' ? 'تأكيد فوري بلا دفع' : subscriptionId ? 'خصم من رصيد الباقة' : 'دفع ثم مراجعة'}</dd></div></dl>
              {service.bookingPolicyNote && <p className="mt-4 rounded-xl border border-antique-gold/30 bg-antique-gold/5 px-4 py-3 text-sm text-text-soft">{service.bookingPolicyNote}</p>}
              {!canCreateBooking && <p className="mt-4 rounded-xl bg-burgundy/10 px-4 py-3 text-sm font-semibold text-burgundy">لا توجد وسيلة دفع مهيأة لهذه الخدمة. يمكن للمالكة نشرها كحجز مجاني لاختبار الرحلة المحلية.</p>}
            </div>
          )}

          {step === 5 && (
            <div className="mt-3">
              <h2 className="text-3xl font-bold text-deep-teal">الدفع وإرسال الإيصال</h2>
              <p className="mt-1 text-text-soft">اختاري الطريقة، حوّلي الإجمالي، ثم ارفعي صورة الإيصال للمراجعة.</p>
              {order ? (
                <form onSubmit={submitProof} className="mt-6 space-y-5">
                  <div className="grid gap-3 sm:grid-cols-3">
                    {paymentMethods.map((item) => (
                      <label key={item.id} className={cn('cursor-pointer rounded-2xl border p-4', method === item.id ? 'border-antique-gold bg-antique-gold/5' : 'border-line')}>
                        <input type="radio" name="payment_method" value={item.id} checked={method === item.id} onChange={() => setMethod(item.id)} className="sr-only" />
                        <strong className="block text-deep-teal">{item.label}</strong>
                        <span className="tnum mt-1 block break-all text-xs text-text-soft" dir="ltr">{item.detail}</span>
                      </label>
                    ))}
                  </div>
                  <div className="rounded-2xl bg-deep-teal p-5 text-on-dark">
                    <span className="text-sm text-on-dark/70">المبلغ المطلوب</span>
                    <strong className="tnum mt-1 block text-3xl">{formatPrice(order.total, service.currency)}</strong>
                  </div>
                  <label className="block rounded-2xl border border-dashed border-antique-gold bg-ivory p-5 text-center">
                    <span className="block font-bold text-deep-teal">ارفعي صورة إيصال التحويل</span>
                    <span className="mt-1 block text-xs text-taupe">JPG أو PNG أو WebP — بحد أقصى 5MB</span>
                    <input className="mt-4 block w-full text-sm text-text-soft file:me-3 file:rounded-full file:border-0 file:bg-deep-teal file:px-4 file:py-2 file:text-on-dark" type="file" name="proof" accept="image/png,image/jpeg,image/webp" required />
                  </label>
                  <Button type="submit" disabled={loading || paymentMethods.length === 0} className="w-full">
                    {loading ? 'جارٍ إرسال الإيصال…' : 'إرسال الحجز للمراجعة'}
                  </Button>
                </form>
              ) : (
                <div className="mt-6 rounded-2xl bg-burgundy/10 p-5 text-burgundy">تعذّر إنشاء الطلب. ارجعي خطوة وحاولي مرة أخرى.</div>
              )}
            </div>
          )}

          {error && (
            <div className="mt-5 rounded-xl bg-burgundy/10 px-4 py-3 text-sm font-medium text-burgundy" role="alert">
              {error}
              {error.includes('دخولك') && <Link href={`/auth/login?redirect=${encodeURIComponent('/booking')}`} className="ms-2 underline">تسجيل الدخول</Link>}
            </div>
          )}

          {step < 5 && (
            <div className="mt-8 flex items-center justify-between gap-3 border-t border-line pt-5">
              <Button variant="secondary" disabled={step === 0 || loading} onClick={() => { if (step === 4 && hold) { void releaseBookingHold(hold.id); setHold(null) }; setError(null); setStep((value) => Math.max(0, value - 1)) }}>رجوع</Button>
              <Button disabled={loading} onClick={next}>{loading ? 'جارٍ تثبيت الموعد…' : step === 4 ? (service.paymentMode === 'free' || subscriptionId ? 'تأكيد الحجز' : 'تثبيت الموعد والانتقال للدفع') : 'متابعة'}</Button>
            </div>
          )}
        </section>

        <aside className="sticky top-24 rounded-3xl border border-line bg-deep-teal p-6 text-on-dark shadow-card">
          <p className="text-xs font-bold text-antique-gold">ملخص الحجز</p>
          <h2 className="mt-2 text-2xl font-bold">{service.title}</h2>
          <p className="mt-2 text-sm leading-relaxed text-on-dark/70">{service.description}</p>
          <dl className="mt-6 space-y-3 border-y border-on-dark/15 py-5 text-sm">
            <div className="flex justify-between gap-4"><dt className="text-on-dark/60">التاريخ</dt><dd className="font-semibold">{date ? longDateFormatter.format(new Date(`${date}T12:00:00Z`)) : 'اختاري التاريخ'}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-on-dark/60">الوقت</dt><dd className="tnum font-semibold">{time ? timeLabel(time) : 'اختاري الوقت'}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-on-dark/60">المدة</dt><dd className="font-semibold">{service.durationMinutes.toLocaleString('ar-EG')} دقيقة</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-on-dark/60">الحالة</dt><dd className="font-semibold">تأكيد بعد مراجعة الدفع</dd></div>
          </dl>
          <div className="mt-5 flex items-end justify-between gap-4">
            <span className="text-sm text-on-dark/60">الإجمالي</span>
            <strong className="tnum text-2xl text-antique-gold">{formatPrice(order?.total ?? service.price, service.currency)}</strong>
          </div>
          <p className="mt-5 rounded-xl bg-on-dark/8 p-3 text-xs leading-relaxed text-on-dark/70">لا يُعد الطلب مؤكدًا إلا بعد اكتمال شروط الحجز المنشورة وتحديث حالته.</p>
        </aside>
      </div>
    </div>
  )
}
