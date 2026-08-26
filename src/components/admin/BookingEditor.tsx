'use client'

import { useState } from 'react'
import { saveBookingAdmin } from '@/lib/actions/admin-control'
import { Button } from '@/components/ui/Button'

export type BookingAdminItem = {
  id: string; startsAt: string; endsAt: string; status: string; meetingUrl: string | null;
  customerNotes: string | null; adminNotes: string
}

function localDate(value: string) {
  const date = new Date(value); const offset = date.getTimezoneOffset() * 60_000
  return new Date(date.getTime() - offset).toISOString().slice(0,16)
}

export function BookingEditor({ booking }: { booking: BookingAdminItem }) {
  const [busy, setBusy] = useState(false); const [message, setMessage] = useState<string | null>(null)
  const input = 'min-h-10 w-full rounded-xl border border-line bg-surface-raised px-3 py-2 text-sm text-ink'
  return <details className="min-w-72 rounded-xl border border-line bg-ivory/40"><summary className="cursor-pointer list-none px-4 py-2 text-sm font-bold text-deep-teal">تعديل كامل</summary><form className="grid gap-3 border-t border-line p-4" onSubmit={async (event) => {
    event.preventDefault(); setBusy(true); const result = await saveBookingAdmin(booking.id, new FormData(event.currentTarget)); setMessage(result.ok ? 'تم تحديث الحجز.' : result.error); setBusy(false)
  }}>
    <label className="text-xs font-bold text-deep-teal">البداية<input name="starts_at" type="datetime-local" defaultValue={localDate(booking.startsAt)} className={input} required /></label>
    <label className="text-xs font-bold text-deep-teal">النهاية<input name="ends_at" type="datetime-local" defaultValue={localDate(booking.endsAt)} className={input} required /></label>
    <label className="text-xs font-bold text-deep-teal">الحالة<select name="status" defaultValue={booking.status} className={input}><option value="pending">بانتظار التأكيد</option><option value="confirmed">مؤكد</option><option value="completed">مكتمل</option><option value="cancelled">ملغي</option><option value="no_show">تغيّب</option></select></label>
    <label className="text-xs font-bold text-deep-teal">رابط اللقاء<input name="meeting_url" defaultValue={booking.meetingUrl ?? ''} className={input} dir="ltr" /></label>
    <label className="text-xs font-bold text-deep-teal">ملاحظات العميلة<textarea name="customer_notes" defaultValue={booking.customerNotes ?? ''} className={input} rows={2} /></label>
    <label className="text-xs font-bold text-deep-teal">ملاحظات داخلية<textarea name="admin_notes" defaultValue={booking.adminNotes} className={input} rows={2} /></label>
    {message && <p role="status" className="text-xs font-semibold text-deep-teal">{message}</p>}
    <Button type="submit" size="sm" disabled={busy}>{busy ? 'جاري الحفظ…' : 'حفظ كل التعديلات'}</Button>
  </form></details>
}
