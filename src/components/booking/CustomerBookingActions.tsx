'use client'

import { useState } from 'react'
import { cancelMyBooking, requestMyBookingReschedule } from '@/lib/actions/booking-customer'
import { Button } from '@/components/ui/Button'

export function CustomerBookingActions({ bookingId }: { bookingId: string }) {
  const [open, setOpen] = useState<'cancel'|'reschedule'|null>(null)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const input = 'min-h-11 w-full rounded-xl border border-line bg-surface-raised px-3 text-sm text-ink'
  async function submit(form: FormData) {
    setBusy(true); setMessage(null)
    const result = open === 'cancel'
      ? await cancelMyBooking(bookingId, String(form.get('reason') ?? ''))
      : await requestMyBookingReschedule(bookingId, String(form.get('proposed') ?? ''), String(form.get('reason') ?? ''))
    setMessage(result.ok ? result.message : result.error); setBusy(false)
    if (result.ok) setOpen(null)
  }
  return <div className="space-y-3 md:max-w-sm">
    <div className="flex flex-wrap gap-2"><Button size="sm" variant="secondary" onClick={()=>setOpen(open==='reschedule'?null:'reschedule')}>طلب تغيير الموعد</Button><Button size="sm" variant="ghost" onClick={()=>setOpen(open==='cancel'?null:'cancel')}>إلغاء الحجز</Button></div>
    {open&&<form action={submit} className="space-y-2 rounded-xl border border-line bg-ivory/60 p-3">
      {open==='reschedule'&&<label className="block text-xs font-bold text-deep-teal">الموعد المقترح<input name="proposed" type="datetime-local" className={`mt-1 ${input}`} required /></label>}
      <label className="block text-xs font-bold text-deep-teal">ملاحظة اختيارية<textarea name="reason" rows={2} className={`mt-1 py-2 ${input}`} /></label>
      <Button type="submit" size="sm" disabled={busy}>{busy?'جارٍ الإرسال…':open==='cancel'?'تأكيد الإلغاء':'إرسال الطلب'}</Button>
    </form>}
    {message&&<p role="status" className="text-xs font-semibold text-deep-teal">{message}</p>}
  </div>
}
