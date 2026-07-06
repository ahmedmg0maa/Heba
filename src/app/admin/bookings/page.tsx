import type { Metadata } from 'next'
import { adminList } from '@/lib/data/cms'
import { Table, THead, TBody, TR, TH, TD } from '@/components/ui/Table'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { BookingControls } from '@/components/admin/AdminControls'

export const metadata: Metadata = { title: 'الحجوزات — الإدارة' }

type Row = {
  id: string
  starts_at: string
  status: string
  customer_notes: string | null
  services: { title: string } | { title: string }[] | null
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
  const bookings = await adminList<Row>('bookings', 'id, starts_at, status, customer_notes, services(title)', {
    orderBy: 'starts_at',
    ascending: false,
  })

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-deep-teal">الحجوزات</h1>
        <p className="mt-1 text-text-soft">تأكيد الجلسات وإدارتها — كل تغيير يُخطر العميلة تلقائيًا.</p>
      </header>

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
                    <BookingControls id={b.id} status={b.status} />
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
