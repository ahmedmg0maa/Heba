'use client'

import { useState } from 'react'
import { createCoupon, setCouponActive, createOffer, setOfferActive, updateCoupon, deleteCoupon, updateOffer, deleteOffer } from '@/lib/actions/marketing'
import type { AdminCoupon, AdminOffer } from '@/lib/data/admin'
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

function localDate(value: string | null) { if (!value) return ''; const date=new Date(value);const offset=date.getTimezoneOffset()*60000;return new Date(date.getTime()-offset).toISOString().slice(0,16) }

export function CouponEdit({coupon}:{coupon:AdminCoupon}) {
  const [busy,setBusy]=useState(false);const[message,setMessage]=useState<string|null>(null);const[confirm,setConfirm]=useState(false);const input='min-h-10 w-full rounded-xl border border-line bg-surface-raised px-3 py-2 text-sm text-ink'
  return <details className="min-w-64 rounded-xl border border-line bg-ivory/40"><summary className="cursor-pointer list-none px-4 py-2 text-sm font-bold text-deep-teal">تعديل وحذف</summary><form className="grid gap-3 border-t border-line p-4" onSubmit={async(e)=>{e.preventDefault();setBusy(true);const r=await updateCoupon(coupon.id,new FormData(e.currentTarget));setMessage(r.ok?'تم التعديل.':r.error);setBusy(false)}}>
    <input name="code" defaultValue={coupon.code} className={input} dir="ltr" required/><select name="kind" defaultValue={coupon.kind} className={input}><option value="percent">نسبة</option><option value="fixed">مبلغ</option></select><input name="value" type="number" min="1" defaultValue={coupon.value} className={input}/><input name="max_uses" type="number" min="1" defaultValue={coupon.maxUses??''} placeholder="الحد الكلي" className={input}/><input name="max_uses_per_user" type="number" min="1" defaultValue={coupon.maxUsesPerUser} className={input}/><input name="ends_at" type="datetime-local" defaultValue={localDate(coupon.endsAt)} className={input}/>{message&&<p className="text-xs font-semibold text-deep-teal">{message}</p>}<div className="flex gap-2"><Button type="submit" size="sm" disabled={busy}>حفظ</Button>{!confirm?<Button type="button" size="sm" variant="burgundy" onClick={()=>setConfirm(true)}>حذف</Button>:<Button type="button" size="sm" variant="burgundy" onClick={async()=>{setBusy(true);const r=await deleteCoupon(coupon.id);setMessage(r.ok?'حُذف.':r.error);setBusy(false)}}>تأكيد</Button>}</div>
  </form></details>
}

export function OfferEdit({offer}:{offer:AdminOffer}) {
  const [busy,setBusy]=useState(false);const[message,setMessage]=useState<string|null>(null);const[confirm,setConfirm]=useState(false);const input='min-h-10 w-full rounded-xl border border-line bg-surface-raised px-3 py-2 text-sm text-ink'
  return <details className="min-w-64 rounded-xl border border-line bg-ivory/40"><summary className="cursor-pointer list-none px-4 py-2 text-sm font-bold text-deep-teal">تعديل وحذف</summary><form className="grid gap-3 border-t border-line p-4" onSubmit={async(e)=>{e.preventDefault();setBusy(true);const r=await updateOffer(offer.id,new FormData(e.currentTarget));setMessage(r.ok?'تم التعديل.':r.error);setBusy(false)}}>
    <input name="title" defaultValue={offer.title} className={input} required/><textarea name="description" defaultValue={offer.description} className={input}/><select name="kind" defaultValue={offer.kind} className={input}><option value="flash_sale">تخفيض سريع</option><option value="countdown">عداد</option><option value="seasonal">موسمي</option><option value="limited_seats">مقاعد</option><option value="bundle">حزمة</option></select><input name="badge_text" defaultValue={offer.badgeText??''} className={input}/><select name="discount_kind" defaultValue={offer.discountKind??'percent'} className={input}><option value="percent">نسبة</option><option value="fixed">مبلغ</option></select><input name="discount_value" type="number" min="1" defaultValue={offer.discountValue??''} className={input}/><select name="target_type" defaultValue={offer.targetTypes[0]??''} className={input}><option value="">الكل</option><option value="course">الدورات</option><option value="book">الكتب</option><option value="workshop">الورش</option><option value="session">الجلسات</option></select><input name="ends_at" type="datetime-local" defaultValue={localDate(offer.endsAt)} className={input}/>{message&&<p className="text-xs font-semibold text-deep-teal">{message}</p>}<div className="flex gap-2"><Button type="submit" size="sm" disabled={busy}>حفظ</Button>{!confirm?<Button type="button" size="sm" variant="burgundy" onClick={()=>setConfirm(true)}>حذف</Button>:<Button type="button" size="sm" variant="burgundy" onClick={async()=>{setBusy(true);const r=await deleteOffer(offer.id);setMessage(r.ok?'حُذف.':r.error);setBusy(false)}}>تأكيد</Button>}</div>
  </form></details>
}
