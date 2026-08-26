'use client'

import { useState } from 'react'
import { adjustSubscriptionCredit, createSubscription, deleteSubscription, deleteSubscriptionPlan, saveSubscriptionPlan, updateSubscriptionStatus } from '@/lib/actions/admin-control'
import { Button } from '@/components/ui/Button'

export type PlanAdmin = {
  id: string
  title: string
  slug: string
  description: string
  price: number
  currency: string
  billing_interval: string
  duration_days: number
  sessions_included: number
  max_subscribers: number | null
  features: string[]
  starts_at: string | null
  ends_at: string | null
  is_active: boolean
  is_published: boolean
  sort: number
  activeCount: number
  eligibleServiceIds: string[]
  product_id: string | null
}

function localDate(value: string | null) {
  if (!value) return ''
  const date = new Date(value)
  const offset = date.getTimezoneOffset() * 60_000
  return new Date(date.getTime() - offset).toISOString().slice(0, 16)
}

function PlanForm({ plan, services, packageProducts }: { plan?: PlanAdmin; services: { id: string; title: string }[]; packageProducts: { id: string; title: string }[] }) {
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const input = 'min-h-11 w-full rounded-xl border border-line bg-surface-raised px-4 py-2 text-ink focus:border-deep-teal focus:outline-2 focus:outline-deep-teal/15'
  const prefix = `plan-${plan?.id ?? 'new'}`
  return <form className="grid gap-4 md:grid-cols-2" onSubmit={async (event) => {
    event.preventDefault(); setBusy(true); setMessage(null)
    const result = await saveSubscriptionPlan(plan?.id ?? null, new FormData(event.currentTarget))
    setMessage(result.ok ? 'تم حفظ الباقة.' : result.error); setBusy(false)
    if (result.ok && !plan) event.currentTarget.reset()
  }}>
    {[
      ['title','اسم الباقة','text',plan?.title ?? ''], ['slug','الرابط','text',plan?.slug ?? ''],
      ['price','السعر','number',plan?.price ?? 0], ['currency','العملة','text',plan?.currency ?? 'EGP'],
      ['duration_days','المدة بالأيام','number',plan?.duration_days ?? 30],
      ['sessions_included','الجلسات المشمولة','number',plan?.sessions_included ?? 0],
      ['max_subscribers','الحد الأقصى للمشتركات','number',plan?.max_subscribers ?? ''],
      ['sort','الترتيب','number',plan?.sort ?? 0],
    ].map(([name,label,type,value]) => <label key={String(name)} htmlFor={`${prefix}-${name}`} className="flex flex-col gap-1.5 text-sm font-semibold text-deep-teal">
      {label}<input id={`${prefix}-${name}`} name={String(name)} type={String(type)} defaultValue={value} min={type === 'number' ? 0 : undefined} step={name === 'price' ? '0.01' : undefined} required={['title','slug','price','duration_days'].includes(String(name))} className={input} dir={['slug','currency'].includes(String(name)) ? 'ltr' : 'rtl'} />
    </label>)}
    <label className="flex flex-col gap-1.5 text-sm font-semibold text-deep-teal">دورية الباقة
      <select name="billing_interval" defaultValue={plan?.billing_interval ?? 'month'} className={input}>
        <option value="month">شهري</option><option value="quarter">ربع سنوي</option><option value="year">سنوي</option><option value="one_time">مرة واحدة</option>
      </select>
    </label>
    <label className="flex flex-col gap-1.5 text-sm font-semibold text-deep-teal">منتج الشراء المرتبط
      <select name="product_id" defaultValue={plan?.product_id ?? ''} className={input}><option value="">تفعيل إداري فقط</option>{packageProducts.map(product=><option key={product.id} value={product.id}>{product.title}</option>)}</select>
      <span className="text-xs font-normal text-text-soft">عند دفع هذا المنتج تُفعّل الباقة تلقائيًا.</span>
    </label>
    <label className="flex flex-col gap-1.5 text-sm font-semibold text-deep-teal">تبدأ في
      <input name="starts_at" type="datetime-local" defaultValue={localDate(plan?.starts_at ?? null)} className={input} dir="ltr" />
    </label>
    <label className="flex flex-col gap-1.5 text-sm font-semibold text-deep-teal">تنتهي في
      <input name="ends_at" type="datetime-local" defaultValue={localDate(plan?.ends_at ?? null)} className={input} dir="ltr" />
    </label>
    <label className="flex flex-col gap-1.5 text-sm font-semibold text-deep-teal md:col-span-2">الوصف
      <textarea name="description" rows={3} defaultValue={plan?.description} className={input} />
    </label>
    <label className="flex flex-col gap-1.5 text-sm font-semibold text-deep-teal md:col-span-2">المزايا — ميزة في كل سطر
      <textarea name="features" rows={5} defaultValue={plan?.features.join('\n')} className={input} />
    </label>
    <fieldset className="space-y-3 rounded-xl border border-line bg-ivory/50 p-4 md:col-span-2">
      <legend className="px-2 text-sm font-bold text-deep-teal">الخدمات التي يمكن حجزها برصيد هذه الباقة</legend>
      {services.length === 0 ? <p className="text-sm text-text-soft">أضيفي خدمة نشطة أولًا، ثم اربطيها بالباقة.</p> : <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => <label key={service.id} className="flex min-h-11 items-center gap-2 rounded-lg border border-line bg-surface-raised px-3 text-sm text-ink">
          <input type="checkbox" name="eligible_service_ids" value={service.id} defaultChecked={plan?.eligibleServiceIds.includes(service.id)} className="accent-deep-teal" />
          {service.title}
        </label>)}
      </div>}
    </fieldset>
    <div className="flex flex-wrap gap-4 md:col-span-2">
      <label className="flex items-center gap-2 text-sm font-bold text-deep-teal"><input type="checkbox" name="is_active" defaultChecked={plan?.is_active ?? true} className="accent-deep-teal" /> مفعّلة للبيع</label>
      <label className="flex items-center gap-2 text-sm font-bold text-deep-teal"><input type="checkbox" name="is_published" defaultChecked={plan?.is_published} className="accent-deep-teal" /> منشورة للزوار</label>
    </div>
    {message && <p className="md:col-span-2 text-sm font-semibold text-deep-teal" role="status">{message}</p>}
    <Button type="submit" disabled={busy} className="justify-self-start">{busy ? 'جاري الحفظ…' : plan ? 'حفظ تعديلات الباقة' : 'إنشاء الباقة'}</Button>
  </form>
}

export function MembershipPlansManager({ plans, services, packageProducts }: { plans: PlanAdmin[]; services: { id: string; title: string }[]; packageProducts: { id: string; title: string }[] }) {
  const [confirm, setConfirm] = useState<string | null>(null)
  return <div className="space-y-5">
    <details className="rounded-2xl border border-antique-gold/30 bg-surface-raised shadow-card">
      <summary className="cursor-pointer list-none px-6 py-5 font-heading text-xl font-bold text-deep-teal">إضافة باقة شهرية أو سنوية جديدة</summary>
      <div className="border-t border-line p-6"><PlanForm services={services} packageProducts={packageProducts} /></div>
    </details>
    {plans.map((plan) => <details key={plan.id} className="rounded-2xl border border-line bg-surface-raised shadow-card">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5">
        <div><h3 className="font-heading text-xl font-bold text-deep-teal">{plan.title}</h3><p className="mt-1 text-sm text-text-soft">{plan.price.toLocaleString('ar-EG')} {plan.currency} · {plan.activeCount.toLocaleString('ar-EG')} اشتراك نشط</p></div>
        <span className={`rounded-full px-3 py-1 text-xs font-bold ${plan.is_published ? 'bg-aqua/15 text-deep-teal' : 'bg-sand/50 text-text-soft'}`}>{plan.is_published ? 'منشورة' : 'مسودة'}</span>
      </summary>
      <div className="space-y-5 border-t border-line p-6"><PlanForm plan={plan} services={services} packageProducts={packageProducts} />
        <div className="border-t border-line pt-4">
          {confirm !== plan.id ? <Button variant="burgundy" size="sm" onClick={() => setConfirm(plan.id)}>أرشفة الباقة</Button> : <div className="flex items-center gap-3"><Button variant="burgundy" size="sm" onClick={() => deleteSubscriptionPlan(plan.id)}>تأكيد الأرشفة</Button><Button variant="ghost" size="sm" onClick={() => setConfirm(null)}>تراجع</Button></div>}
        </div>
      </div>
    </details>)}
  </div>
}

export function SubscriptionStatusControl({ id, status }: { id: string; status: string }) {
  const [busy, setBusy] = useState(false)
  return <div className="flex flex-wrap gap-2"><select value={status} disabled={busy} onChange={async (event) => {
    setBusy(true); await updateSubscriptionStatus(id, event.target.value); setBusy(false)
  }} className="min-h-10 rounded-xl border border-line bg-surface-raised px-3 text-sm text-ink">
    <option value="pending">بانتظار التفعيل</option><option value="active">نشط</option><option value="paused">موقوف مؤقتًا</option><option value="cancelled">ملغي</option><option value="expired">منتهي</option>
  </select><Button size="sm" variant="burgundy" disabled={busy} onClick={async()=>{setBusy(true);await deleteSubscription(id);setBusy(false)}}>إلغاء وأرشفة</Button></div>
}

export function SubscriptionCreditControl({ id, balance, included }: { id: string; balance: number; included: number }) {
  const [busy,setBusy]=useState(false);const[message,setMessage]=useState<string|null>(null)
  async function adjust(delta:1|-1){setBusy(true);const result=await adjustSubscriptionCredit(id,delta,delta<0?'استهلاك جلسة يدوي':'استرجاع جلسة يدوي');setMessage(result.ok?'سُجلت الحركة.':result.error);setBusy(false)}
  return <div className="space-y-2"><p className="font-bold text-deep-teal">{balance.toLocaleString('ar-EG')} / {included.toLocaleString('ar-EG')} متبقية</p><div className="flex gap-1"><Button size="sm" disabled={busy||balance<=0} onClick={()=>adjust(-1)}>استهلاك</Button><Button size="sm" variant="secondary" disabled={busy||balance>=included} onClick={()=>adjust(1)}>استرجاع</Button></div>{message&&<p className="text-xs text-text-soft">{message}</p>}</div>
}

export function SubscriptionCreate({plans,customers}:{plans:{id:string;title:string}[];customers:{id:string;name:string;email:string}[]}){const[busy,setBusy]=useState(false);const[message,setMessage]=useState<string|null>(null);return <form className="grid gap-3 rounded-2xl border border-line bg-surface-raised p-6 md:grid-cols-2" onSubmit={async(e)=>{e.preventDefault();setBusy(true);const r=await createSubscription(new FormData(e.currentTarget));setMessage(r.ok?'تم تفعيل الاشتراك.':r.error);setBusy(false);if(r.ok)e.currentTarget.reset()}}><select name="user_id" required className="min-h-11 rounded-xl border border-line bg-ivory px-3 text-ink"><option value="">اختاري العميلة</option>{customers.map(c=><option key={c.id} value={c.id}>{c.name} — {c.email}</option>)}</select><select name="plan_id" required className="min-h-11 rounded-xl border border-line bg-ivory px-3 text-ink"><option value="">اختاري الباقة</option>{plans.map(p=><option key={p.id} value={p.id}>{p.title}</option>)}</select><select name="status" className="min-h-11 rounded-xl border border-line bg-ivory px-3 text-ink"><option value="active">نشط</option><option value="pending">بانتظار التفعيل</option></select><input name="admin_notes" placeholder="ملاحظات داخلية" className="min-h-11 rounded-xl border border-line bg-ivory px-3 text-ink"/>{message&&<p className="text-sm font-semibold text-deep-teal md:col-span-2">{message}</p>}<Button type="submit" disabled={busy} className="justify-self-start">تفعيل اشتراك يدوي</Button></form>}
