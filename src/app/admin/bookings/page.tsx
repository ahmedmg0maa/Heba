import type { Metadata } from 'next'
import { adminList, getPublicMediaOptions } from '@/lib/data/cms'
import { Table, THead, TBody, TR, TH, TD } from '@/components/ui/Table'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { BookingControls } from '@/components/admin/AdminControls'
import { AvailabilityManager } from '@/components/admin/AvailabilityManager'
import { Card, CardTitle } from '@/components/ui/Card'
import { CatalogCreatePanel, CatalogEditPanel } from '@/components/admin/CatalogManager'
import { BookingEditor } from '@/components/admin/BookingEditor'
import { BookingAgenda } from '@/components/admin/BookingAgenda'

export const metadata: Metadata = { title: 'الحجوزات — الإدارة' }

type Row = {
  id: string
  starts_at: string
  ends_at: string
  status: string
  customer_notes: string | null
  meeting_url: string | null
  admin_notes: string
  services: { title: string } | { title: string }[] | null
  profiles: { full_name: string | null } | { full_name: string | null }[] | null
  booking_events: { id: string; event: string; created_at: string }[]
  booking_reschedule_requests: { id: string; proposed_starts_at: string; status: string; reason: string; created_at: string }[]
}

type ServiceRow = {
  id: string
  title: string
  slug: string
  description: string
  duration_minutes: number
  price: number
  is_active: boolean
  booking_payment_mode: 'payment_required' | 'free'
  buffer_before_minutes: number | null
  buffer_after_minutes: number | null
  minimum_notice_minutes: number | null
  booking_window_days: number | null
  hold_minutes: number
  cancellation_notice_hours: number | null
  reschedule_notice_hours: number | null
  max_reschedules: number
  booking_policy_note: string
  products: { compare_at_price: number | null; currency: string; subtitle: string | null; sort: number; cover_url: string | null } | { compare_at_price: number | null; currency: string; subtitle: string | null; sort: number; cover_url: string | null }[]
  availability_rules: { id: string; weekday: number; start_time: string; end_time: string }[]
  availability_exceptions: { id: string; date: string; is_closed: boolean; start_time: string | null; end_time: string | null; kind: string; reason: string }[]
  booking_slot_overrides: { id: string; date: string; start_time: string; mode: 'open' | 'closed'; reason: string }[]
}

const dateFmt = new Intl.DateTimeFormat('ar-EG', { weekday: 'short', day: 'numeric', month: 'long', hour: 'numeric', minute: '2-digit' })

const statusMap: Record<string, { label: string; tone: 'success' | 'pending' | 'sand' | 'danger' }> = {
  pending: { label: 'بانتظار التأكيد', tone: 'pending' },
  confirmed: { label: 'مؤكد', tone: 'success' },
  completed: { label: 'مكتمل', tone: 'sand' },
  cancelled: { label: 'ملغي', tone: 'danger' },
  no_show: { label: 'تغيّب', tone: 'danger' },
}

export default async function AdminBookingsPage() {
  const [bookings, serviceRows, media] = await Promise.all([
    adminList<Row>('bookings', 'id, starts_at, ends_at, status, customer_notes, meeting_url, admin_notes, services(title), profiles(full_name), booking_events(id,event,created_at), booking_reschedule_requests(id,proposed_starts_at,status,reason,created_at)', {
      orderBy: 'starts_at',
      ascending: false,
    }),
    adminList<ServiceRow>('services', 'id, title, slug, description, duration_minutes, price, is_active, booking_payment_mode, buffer_before_minutes, buffer_after_minutes, minimum_notice_minutes, booking_window_days, hold_minutes, cancellation_notice_hours, reschedule_notice_hours, max_reschedules, booking_policy_note, products(compare_at_price, currency, subtitle, sort, cover_url), availability_rules(id, weekday, start_time, end_time), availability_exceptions(id, date, is_closed, start_time, end_time, kind, reason), booking_slot_overrides(id, date, start_time, mode, reason)', {
      orderBy: 'created_at',
      ascending: true,
    }),
    getPublicMediaOptions(),
  ])
  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-deep-teal">الحجوزات</h1>
        <p className="mt-1 text-text-soft">إدارة الخدمة والتوافر والحجوزات بتوقيت القاهرة. تُسجّل التغييرات في السجل التشغيلي.</p>
      </header>

      <CatalogCreatePanel kind="service" media={media} />

      {serviceRows.length > 0 && <Card><CardTitle>الخدمات والسياسات</CardTitle><div className="mt-5 grid gap-4 md:grid-cols-2">{serviceRows.map((service) => {
        const product = Array.isArray(service.products) ? service.products[0] : service.products
        return <div key={service.id} className="rounded-xl border border-line bg-ivory/45 p-4"><div className="mb-3"><h3 className="font-bold text-deep-teal">{service.title}</h3><p className="text-sm text-text-soft">{Number(service.price).toLocaleString('ar-EG')} EGP · {service.duration_minutes.toLocaleString('ar-EG')} دقيقة · {service.booking_payment_mode === 'free' ? 'مجاني' : 'يتطلب دفعًا'}</p></div><CatalogEditPanel kind="service" media={media} item={{ id: service.id, title: service.title, slug: service.slug, description: service.description, price: Number(service.price), compareAtPrice: product?.compare_at_price, currency: product?.currency, subtitle: product?.subtitle, coverUrl: product?.cover_url, sort: product?.sort, isPublished: service.is_active, durationMinutes: service.duration_minutes, bookingPaymentMode: service.booking_payment_mode, bufferBeforeMinutes: service.buffer_before_minutes, bufferAfterMinutes: service.buffer_after_minutes, minimumNoticeMinutes: service.minimum_notice_minutes, bookingWindowDays: service.booking_window_days, holdMinutes: service.hold_minutes, cancellationNoticeHours: service.cancellation_notice_hours, rescheduleNoticeHours: service.reschedule_notice_hours, maxReschedules: service.max_reschedules, bookingPolicyNote: service.booking_policy_note }} /></div>
      })}</div></Card>}

      <Card>
        <CardTitle>إتاحة الجلسات</CardTitle>
        <p className="mb-5 mt-1 text-sm text-text-soft">حددي أيام وساعات العمل، وأغلقي الأيام الاستثنائية من هنا. التوقيت: القاهرة.</p>
        <AvailabilityManager services={serviceRows.map((service) => ({ id: service.id, title: service.title, rules: service.availability_rules ?? [], exceptions: service.availability_exceptions ?? [], overrides: service.booking_slot_overrides ?? [] }))} />
      </Card>

      <BookingAgenda bookings={bookings.map((booking) => { const service = Array.isArray(booking.services) ? booking.services[0] : booking.services; const profile = Array.isArray(booking.profiles) ? booking.profiles[0] : booking.profiles; return { id: booking.id, startsAt: booking.starts_at, endsAt: booking.ends_at, status: booking.status, serviceTitle: service?.title ?? 'جلسة', customerName: profile?.full_name ?? '', customerNotes: booking.customer_notes, adminNotes: booking.admin_notes, events: (booking.booking_events ?? []).map((event) => ({ id: event.id, event: event.event, createdAt: event.created_at })), requests: (booking.booking_reschedule_requests ?? []).map((request) => ({ id: request.id, proposedStartsAt: request.proposed_starts_at, status: request.status, reason: request.reason, createdAt: request.created_at })) } })} />

      {bookings.length === 0 ? (
        <EmptyState title="لا حجوزات بعد" description="تظهر جلسات العميلات هنا فور حجزها لتأكيدها وإدارتها." />
      ) : (
        <Table>
          <THead>
            <tr>
              <TH>الجلسة</TH>
              <TH>الموعد</TH>
              <TH>الحالة</TH>
              <TH>الإجراء</TH>
            </tr>
          </THead>
          <TBody>
            {bookings.map((b) => {
              const service = Array.isArray(b.services) ? b.services[0] : b.services
              const st = statusMap[b.status] ?? statusMap.pending
              return (
                <TR key={b.id}>
                  <TD>
                    <p className="font-semibold text-deep-teal">{service?.title ?? 'جلسة'}</p>
                    {b.customer_notes && <p className="max-w-56 truncate text-xs text-taupe">{b.customer_notes}</p>}
                  </TD>
                  <TD>{dateFmt.format(new Date(b.starts_at))}</TD>
                  <TD>
                    <Badge tone={st.tone}>{st.label}</Badge>
                  </TD>
                  <TD>
                    <div className="flex flex-wrap items-start gap-2"><BookingControls id={b.id} status={b.status} /><BookingEditor booking={{ id: b.id, startsAt: b.starts_at, endsAt: b.ends_at, status: b.status, meetingUrl: b.meeting_url, customerNotes: b.customer_notes, adminNotes: b.admin_notes }} /></div>
                  </TD>
                </TR>
              )
            })}
          </TBody>
        </Table>
      )}
    </div>
  )
}
