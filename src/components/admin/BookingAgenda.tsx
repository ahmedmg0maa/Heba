'use client'

import { useMemo, useState } from 'react'
import { resolveBookingReschedule } from '@/lib/actions/booking-admin'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'

export type AgendaBooking = {
  id: string
  startsAt: string
  endsAt: string
  status: string
  serviceTitle: string
  customerName: string
  customerNotes: string | null
  adminNotes: string
  events: { id: string; event: string; createdAt: string }[]
  requests: { id: string; proposedStartsAt: string; status: string; reason: string; createdAt: string }[]
}

const statusTone: Record<string, 'success' | 'pending' | 'sand' | 'danger'> = { pending: 'pending', confirmed: 'success', completed: 'sand', cancelled: 'danger', no_show: 'danger' }
const statusLabel: Record<string, string> = { pending: 'بانتظار التأكيد', confirmed: 'مؤكد', completed: 'مكتمل', cancelled: 'ملغي', no_show: 'تغيّب' }
const eventLabel: Record<string, string> = {
  'booking.created': 'أُنشئ الحجز', 'booking.free_confirmed': 'تأكّد الحجز المجاني', 'customer.cancelled': 'ألغت العميلة الحجز',
  'customer.reschedule_requested': 'طلبت العميلة تغيير الموعد', 'admin.reschedule_approved': 'وافقت الإدارة على تغيير الموعد', 'admin.reschedule_declined': 'رفضت الإدارة طلب التغيير',
}
const cairoDate = (value: string) => new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Cairo' }).format(new Date(value))
const time = (value: string) => new Intl.DateTimeFormat('ar-EG', { hour: 'numeric', minute: '2-digit', timeZone: 'Africa/Cairo' }).format(new Date(value))

export function BookingAgenda({ bookings }: { bookings: AgendaBooking[] }) {
  const [view, setView] = useState<'day' | 'week' | 'month'>('week')
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')
  const [message, setMessage] = useState<string | null>(null)
  const today = cairoDate(new Date().toISOString())
  const visible = useMemo(() => bookings.filter((booking) => {
    const q = query.trim().toLocaleLowerCase('ar-EG')
    if (status !== 'all' && booking.status !== status) return false
    if (q && ![booking.serviceTitle, booking.customerName, booking.customerNotes ?? '', booking.adminNotes].join(' ').toLocaleLowerCase('ar-EG').includes(q)) return false
    const day = cairoDate(booking.startsAt)
    if (view === 'day') return day === today
    if (view === 'week') {
      const start = new Date(`${today}T12:00:00Z`); start.setUTCDate(start.getUTCDate() - start.getUTCDay())
      const end = new Date(start); end.setUTCDate(end.getUTCDate() + 7)
      const current = new Date(`${day}T12:00:00Z`)
      return current >= start && current < end
    }
    return day.slice(0, 7) === today.slice(0, 7)
  }), [bookings, query, status, today, view])
  const groups = Map.groupBy(visible, (booking) => cairoDate(booking.startsAt))
  return <section className="rounded-2xl border border-line bg-surface-raised p-5 shadow-card">
    <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between"><div><h2 className="text-xl font-bold text-deep-teal">أجندة التشغيل</h2><p className="mt-1 text-sm text-text-soft">اليوم/الأسبوع/الشهر بتوقيت القاهرة، مع بحث وحالة وسجل تنفيذ.</p></div><div className="flex flex-wrap gap-2"><div className="flex rounded-xl border border-line p-1">{(['day','week','month'] as const).map((item) => <button key={item} type="button" onClick={() => setView(item)} className={`min-h-9 rounded-lg px-3 text-sm font-bold ${view === item ? 'bg-deep-teal text-on-dark' : 'text-deep-teal'}`}>{item === 'day' ? 'يوم' : item === 'week' ? 'أسبوع' : 'شهر'}</button>)}</div><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="بحث بالعميلة أو الخدمة" className="min-h-11 rounded-xl border border-line bg-ivory/45 px-3 text-sm text-ink" /><select value={status} onChange={(event) => setStatus(event.target.value)} className="min-h-11 rounded-xl border border-line bg-ivory/45 px-3 text-sm text-ink"><option value="all">كل الحالات</option>{Object.entries(statusLabel).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div></div>
    <div className="mt-5 grid gap-4 lg:grid-cols-2">{groups.size === 0 ? <p className="text-sm text-text-soft">لا توجد حجوزات مطابقة لهذا العرض.</p> : [...groups].sort(([a], [b]) => a.localeCompare(b)).map(([day, items]) => <section key={day} className="rounded-xl border border-line bg-ivory/40 p-4"><h3 className="font-bold text-deep-teal">{new Intl.DateTimeFormat('ar-EG', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Africa/Cairo' }).format(new Date(`${day}T12:00:00Z`))}</h3><div className="mt-3 space-y-3">{items.sort((a, b) => a.startsAt.localeCompare(b.startsAt)).map((booking) => <article key={booking.id} className="rounded-xl border border-line bg-surface-raised p-3"><div className="flex flex-wrap items-center justify-between gap-2"><div><strong className="text-deep-teal">{time(booking.startsAt)} — {booking.serviceTitle}</strong><p className="mt-1 text-xs text-text-soft">{booking.customerName || 'عميلة مسجلة'}</p></div><Badge tone={statusTone[booking.status] ?? 'pending'}>{statusLabel[booking.status] ?? booking.status}</Badge></div>{booking.customerNotes && <p className="mt-2 text-xs text-text-soft">ملاحظة العميلة: {booking.customerNotes}</p>}{booking.adminNotes && <p className="mt-2 text-xs font-semibold text-deep-teal">ملاحظة داخلية: {booking.adminNotes}</p>}<details className="mt-3 text-xs text-taupe"><summary className="cursor-pointer font-bold text-deep-teal">التفاصيل والسجل</summary><ol className="mt-2 space-y-1">{booking.events.slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map((event) => <li key={event.id}>{time(event.createdAt)} — {eventLabel[event.event] ?? event.event}</li>)}</ol></details>{booking.requests.filter((request) => request.status === 'pending').map((request) => <div key={request.id} className="mt-3 rounded-lg bg-antique-gold/10 p-3 text-xs"><p className="font-bold text-deep-teal">طلب تغيير إلى {new Intl.DateTimeFormat('ar-EG', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit', timeZone: 'Africa/Cairo' }).format(new Date(request.proposedStartsAt))}</p>{request.reason && <p className="mt-1 text-text-soft">{request.reason}</p>}<div className="mt-2 flex gap-2"><Button size="sm" onClick={async () => { const result = await resolveBookingReschedule(request.id, true); setMessage(result.ok ? 'تمت الموافقة وتحديث الأجندة.' : result.error) }}>قبول</Button><Button size="sm" variant="secondary" onClick={async () => { const result = await resolveBookingReschedule(request.id, false); setMessage(result.ok ? 'تم رفض الطلب.' : result.error) }}>رفض</Button></div></div>)}</article>)}</div></section>)}</div>
    {message && <p role="status" className="mt-4 rounded-xl bg-deep-teal/8 px-3 py-2 text-sm font-semibold text-deep-teal">{message}</p>}
  </section>
}
