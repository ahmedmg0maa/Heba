import type { Metadata } from 'next'
import Link from 'next/link'
import { getAdminKpis, getApprovalQueue, getRecentCustomers, getTodaySchedule } from '@/lib/data/admin'
import { formatPrice } from '@/lib/format'
import { StatCard } from '@/components/ui/StatCard'
import { Card, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { RevenueChart, DonutChart } from '@/components/admin/Charts'
import { ApprovalActions } from '@/components/admin/ApprovalActions'
import { Table, THead, TBody, TR, TH, TD } from '@/components/ui/Table'

export const metadata: Metadata = { title: 'نظرة عامة — الإدارة' }

const timeFmt = new Intl.DateTimeFormat('ar-EG', { hour: 'numeric', minute: '2-digit' })
const dateFmt = new Intl.DateTimeFormat('ar-EG', { day: 'numeric', month: 'short' })

export default async function AdminOverviewPage() {
  const [kpis, approvals, customers, schedule] = await Promise.all([
    getAdminKpis(),
    getApprovalQueue(5),
    getRecentCustomers(),
    getTodaySchedule(),
  ])

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-deep-teal">نظرة عامة</h1>
        <p className="mt-1 text-text-soft">نبض المنصة اليوم — الإيرادات والموافقات والمواعيد.</p>
      </header>

      {/* KPI strip */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="إيرادات الشهر" value={formatPrice(kpis.revenueThisMonth)} accent="teal" sparkline={kpis.revenueByDay.length > 1 ? kpis.revenueByDay : undefined} />
        <StatCard label="مدفوعات بانتظار المراجعة" value={kpis.pendingPayments.toLocaleString('ar-EG')} accent="gold" />
        <StatCard label="التحاقات الدورات" value={kpis.activeStudents.toLocaleString('ar-EG')} accent="cobalt" />
        <StatCard label="حجوزات قادمة" value={kpis.upcomingBookings.toLocaleString('ar-EG')} accent="burgundy" />
      </div>

      {/* Charts */}
      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <Card>
          <CardTitle className="mb-4">الإيرادات — آخر ٦ أشهر</CardTitle>
          <RevenueChart data={kpis.revenueByMonth} />
        </Card>
        <Card>
          <CardTitle className="mb-4">الحجوزات حسب الحالة</CardTitle>
          <DonutChart data={kpis.bookingsByStatus} />
        </Card>
      </div>

      {/* Approvals */}
      <Card className="p-0">
        <div className="flex items-center justify-between p-6 pb-4">
          <CardTitle>موافقات الدفع</CardTitle>
          <Link href="/admin/payments" className="text-sm font-semibold text-burgundy">
            القائمة الكاملة
          </Link>
        </div>
        {approvals.length === 0 ? (
          <p className="border-t border-line px-6 py-10 text-center text-sm text-taupe">
            لا مدفوعات بانتظار المراجعة — صندوقك نظيف ✨
          </p>
        ) : (
          <Table className="rounded-none border-x-0 border-b-0 shadow-none">
            <THead>
              <tr>
                <TH>العميلة</TH>
                <TH>المنتج</TH>
                <TH>المبلغ</TH>
                <TH>الإجراء</TH>
              </tr>
            </THead>
            <TBody>
              {approvals.map((a) => (
                <TR key={a.paymentId}>
                  <TD className="font-semibold text-deep-teal">{a.customerName}</TD>
                  <TD className="max-w-48 truncate">{a.productTitles.join(' + ') || '—'}</TD>
                  <TD>{formatPrice(a.amount)}</TD>
                  <TD>
                    <ApprovalActions paymentId={a.paymentId} hasProof={Boolean(a.proofPath)} />
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        )}
      </Card>

      {/* Customers + schedule */}
      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardTitle className="mb-4">أحدث العميلات</CardTitle>
          {customers.length === 0 ? (
            <p className="py-8 text-center text-sm text-taupe">تظهر العميلات الجدد هنا فور أول تسجيل.</p>
          ) : (
            <ul className="divide-y divide-line/70">
              {customers.map((c) => (
                <li key={c.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-deep-teal/10 font-heading font-bold text-deep-teal" aria-hidden>
                      {c.name.charAt(0)}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-ink">{c.name}</p>
                      <p dir="ltr" className="text-xs text-taupe">{c.email}</p>
                    </div>
                  </div>
                  <span className="tnum text-xs text-taupe">{dateFmt.format(new Date(c.joinedAt))}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <CardTitle className="mb-4">جدول اليوم</CardTitle>
          {schedule.length === 0 ? (
            <p className="py-8 text-center text-sm text-taupe">لا جلسات اليوم — يوم مثالي للمحتوى ☕</p>
          ) : (
            <ol className="space-y-3">
              {schedule.map((s) => (
                <li key={s.id} className="flex items-center gap-4 rounded-xl bg-ivory/60 p-3">
                  <span className="tnum w-16 shrink-0 text-sm font-bold text-deep-teal">
                    {timeFmt.format(new Date(s.startsAt))}
                  </span>
                  <span className="flex-1 text-sm text-ink">{s.title}</span>
                  <Badge tone={s.status === 'confirmed' ? 'success' : 'pending'}>
                    {s.status === 'confirmed' ? 'مؤكد' : 'بانتظار'}
                  </Badge>
                </li>
              ))}
            </ol>
          )}
        </Card>
      </div>
    </div>
  )
}
