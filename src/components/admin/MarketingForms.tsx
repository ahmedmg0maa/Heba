'use client'

import { useState } from 'react'
import { createCoupon, setCouponActive, createOffer, setOfferActive } from '@/lib/actions/marketing'
import { FormField, FormSelect } from '@/components/ui/FormField'
import { Button } from '@/components/ui/Button'

function useSubmit(action: (fd: FormData) => Promise<{ ok: boolean; error?: string }>) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    setBusy(true)
    setError(null)
    const res = await action(new FormData(form))
    if (!res.ok) setError(res.error ?? 'حدث خطأ.')
    else form.reset()
    setBusy(false)
  }
  return { busy, error, onSubmit }
}

export function CouponForm() {
  const { busy, error, onSubmit } = useSubmit(createCoupon)
  return (
    <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
      <FormField label="الكود" name="code" required dir="ltr" hint="أحرف لاتينية وأرقام، مثل WELCOME10" />
      <FormSelect
        label="نوع الخصم"
        name="kind"
        options={[
          { value: 'percent', label: 'نسبة مئوية ٪' },
          { value: 'fixed', label: 'مبلغ ثابت (ج.م)' },
        ]}
      />
      <FormField label="قيمة الخصم" name="value" type="number" min={1} required dir="ltr" />
      <FormField label="حد الاستخدام الكلي (اختياري)" name="max_uses" type="number" min={1} dir="ltr" />
      <FormField label="حد الاستخدام لكل عميلة" name="max_uses_per_user" type="number" min={1} defaultValue={1} dir="ltr" />
      <FormField label="ينتهي في (اختياري)" name="ends_at" type="datetime-local" dir="ltr" />
      {error && (
        <p className="rounded-xl bg-burgundy/10 px-4 py-3 text-sm font-medium text-burgundy sm:col-span-2" role="alert">
          {error}
        </p>
      )}
      <Button type="submit" disabled={busy} className="sm:col-span-2 sm:justify-self-start">
        {busy ? 'لحظات…' : 'إنشاء الكوبون'}
      </Button>
    </form>
  )
}

export function OfferForm() {
  const { busy, error, onSubmit } = useSubmit(createOffer)
  return (
    <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
      <FormField label="عنوان العرض" name="title" required className="sm:col-span-2" />
      <FormField label="الوصف" name="description" className="sm:col-span-2" />
      <FormSelect
        label="نوع الحملة"
        name="kind"
        options={[
          { value: 'flash_sale', label: 'تخفيض سريع' },
          { value: 'countdown', label: 'عدّاد تنازلي' },
          { value: 'seasonal', label: 'حملة موسمية' },
          { value: 'limited_seats', label: 'مقاعد محدودة' },
          { value: 'bundle', label: 'حزمة' },
        ]}
      />
      <FormField label="نص الشارة" name="badge_text" hint="مثال: خصم ٣٠٪" />
      <FormSelect
        label="نوع الخصم"
        name="discount_kind"
        options={[
          { value: 'percent', label: 'نسبة مئوية ٪' },
          { value: 'fixed', label: 'مبلغ ثابت (ج.م)' },
        ]}
      />
      <FormField label="قيمة الخصم" name="discount_value" type="number" min={1} required dir="ltr" />
      <FormSelect
        label="يستهدف"
        name="target_type"
        options={[
          { value: '', label: 'كل المنتجات' },
          { value: 'course', label: 'الدورات' },
          { value: 'book', label: 'الكتب' },
          { value: 'workshop', label: 'ورش العمل' },
          { value: 'session', label: 'الجلسات' },
        ]}
      />
      <FormField label="ينتهي في (اختياري)" name="ends_at" type="datetime-local" dir="ltr" />
      {error && (
        <p className="rounded-xl bg-burgundy/10 px-4 py-3 text-sm font-medium text-burgundy sm:col-span-2" role="alert">
          {error}
        </p>
      )}
      <Button type="submit" disabled={busy} className="sm:col-span-2 sm:justify-self-start">
        {busy ? 'لحظات…' : 'إطلاق العرض'}
      </Button>
    </form>
  )
}

export function ActiveToggle({
  id,
  active,
  kind,
}: {
  id: string
  active: boolean
  kind: 'coupon' | 'offer'
}) {
  const [busy, setBusy] = useState(false)
  return (
    <Button
      variant={active ? 'secondary' : 'primary'}
      size="sm"
      disabled={busy}
      onClick={async () => {
        setBusy(true)
        if (kind === 'coupon') await setCouponActive(id, !active)
        else await setOfferActive(id, !active)
        setBusy(false)
      }}
    >
      {active ? 'إيقاف' : 'تفعيل'}
    </Button>
  )
}
