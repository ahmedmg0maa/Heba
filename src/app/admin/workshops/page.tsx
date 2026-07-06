import type { Metadata } from 'next'
import { adminList } from '@/lib/data/cms'
import { Table, THead, TBody, TR, TH, TD } from '@/components/ui/Table'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { PublishToggle } from '@/components/admin/AdminControls'

export const metadata: Metadata = { title: 'ورش العمل — الإدارة' }

type Row = {
  id: string
  title: string
  starts_at: string
  seats_total: number
  seats_reserved: number
  is_published: boolean
  workshop_registrations: { id: string }[]
}

const dateFmt = new Intl.DateTimeFormat('ar-EG', { day: 'numeric', month: 'long', hour: 'numeric', minute: '2-digit' })

export default async function AdminWorkshopsPage() {
  const workshops = await adminList<Row>(
    'workshops',
    'id, title, starts_at, seats_total, seats_reserved, is_published, workshop_registrations(id)',
    { orderBy: 'starts_at', ascending: true },
  )

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-deep-teal">ورش العمل</h1>
        <p className="mt-1 text-text-soft">الجدول والمقاعد والتسجيلات.</p>
      </header>

      {workshops.length === 0 ? (
        <EmptyState title="لا ورش بعد" description="أنشئي الورشة عبر قاعدة البيانات وستظهر هنا لإدارة النشر والمقاعد." />
      ) : (
        <Table>
          <THead>
            <tr>
              <TH>الورشة</TH>
              <TH>الموعد</TH>
              <TH>المقاعد</TH>
              <TH>التسجيلات</TH>
              <TH>الحالة</TH>
              <TH>الإجراء</TH>
            </tr>
          </THead>
          <TBody>
            {workshops.map((w) => (
              <TR key={w.id}>
                <TD className="font-semibold text-deep-teal">{w.title}</TD>
                <TD>{dateFmt.format(new Date(w.starts_at))}</TD>
                <TD>
                  {w.seats_reserved.toLocaleString('ar-EG')} / {w.seats_total.toLocaleString('ar-EG')}
                </TD>
                <TD>{(w.workshop_registrations ?? []).length.toLocaleString('ar-EG')}</TD>
                <TD>
                  <Badge tone={w.is_published ? 'success' : 'sand'}>{w.is_published ? 'منشورة' : 'مسودة'}</Badge>
                </TD>
                <TD>
                  <PublishToggle table="workshops" id={w.id} published={w.is_published} />
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      )}
    </div>
  )
}
