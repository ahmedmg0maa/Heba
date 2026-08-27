'use client'

import { useState } from 'react'
import { saveBookingAdmin } from '@/lib/actions/admin-control'
import { Button } from '@/components/ui/Button'

export type BookingAdminItem = {
  id: string; startsAt: string; status: string; meetingUrl: string | null;
  customerNotes: string | null; adminNotes: string
}

function localDate(value: string) {
  const date = new Date(value); const offset = date.getTimezoneOffset() * 60_000
  return new Date(date.getTime() - offset).toISOString().slice(0,16)
}

const statusLabels: Record<string, string> = {
  pending: 'بانتظار التأكيد',
  confirmed: 'مؤكد',
  completed: 'مكتمل',
  cancelled: 'ملغي',
  no_show: 'تغيّب',
}

function allowedStatuses(current: string) {
  if (current === 'pending') return ['pending', 'confirmed', 'cancelled']
  if (current === 'confirmed') return ['confirmed', 'completed', 'cancelled', 'no_show']
  return [current]
}

export function BookingEditor({ booking }: { booking: BookingAdminItem }) {
  const [busy, setBusy] = useState(false); const [message, setMessage] = useState<string | null>(null); const [succeeded, setSucceeded] = useState(false)
  const scheduleEditable = booking.status === 'pending' || booking.status === 'confirmed'
  const input = 'min-h-10 w-full rounded-xl border border-line bg-surface-raised px-3 py-2 text-sm text-ink'
  return <details className="min-w-72 rounded-xl border border-line bg-ivory/40"><summary className="cursor-pointer list-none px-4 py-2 text-sm font-bold text-deep-teal">تعديل كامل</summary><form className="grid gap-3 border-t border-line p-4" onSubmit={async (event) => {
    event.preventDefault(); setBusy(true); const result = await saveBookingAdmin(booking.id, new FormData(event.currentTarget)); setSucceeded(result.ok); setMessage(result.ok ? 'تم تحديث الحجز وتسجيل العملية.' : result.error); setBusy(false)
  }}>
    <label className="text-xs font-bold text-deep-teal">البداية<input name="starts_at" type="datetime-local" defaultValue={localDate(booking.startsAt)} className={input} readOnly={!scheduleEditable} required /></label>
    <p className="rounded-lg bg-aqua/8 px-3 py-2 text-xs text-text-soft">تُحسب نهاية الجلسة تلقائيًا من مدة الخدمة المعتمدة.</p>
    {!scheduleEditable && <p className="text-xs font-semibold text-taupe">الحجز منتهٍ؛ يمكن تحديث الرابط أو الملاحظة الداخلية فقط.</p>}
    <label className="text-xs font-bold text-deep-teal">الحالة<select name="status" defaultValue={booking.status} className={input}>{allowedStatuses(booking.status).map((status) => <option key={status} value={status}>{statusLabels[status] ?? status}</option>)}</select></label>
    <label className="text-xs font-bold text-deep-teal">رابط اللقاء الآمن<input name="meeting_url" type="url" pattern="https://.*" maxLength={500} defaultValue={booking.meetingUrl ?? ''} className={input} dir="ltr" placeholder="https://…" /></label>
    <div className="rounded-lg border border-line bg-surface-raised px-3 py-2 text-xs"><p className="font-bold text-deep-teal">ملاحظات العميلة — للقراءة فقط</p><p className="mt-1 whitespace-pre-wrap text-text-soft">{booking.customerNotes || 'لا توجد ملاحظات.'}</p></div>
    <label className="text-xs font-bold text-deep-teal">ملاحظات داخلية<textarea name="admin_notes" defaultValue={booking.adminNotes} maxLength={4000} className={input} rows={2} /></label>
    {message && <p role={succeeded ? 'status' : 'alert'} className={`text-xs font-semibold ${succeeded ? 'text-deep-teal' : 'text-burgundy'}`}>{message}</p>}
    <Button type="submit" size="sm" disabled={busy}>{busy ? 'جاري الحفظ…' : 'حفظ كل التعديلات'}</Button>
  </form></details>
}
