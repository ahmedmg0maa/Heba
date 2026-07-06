import type { Metadata } from 'next'
import { getMyOrders } from '@/lib/data/dashboard'
import { formatPrice, isPast } from '@/lib/format'
import { Table, THead, TBody, TR, TH, TD } from '@/components/ui/Table'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'

export const metadata: Metadata = { title: 'طلباتي' }

const dateFmt = new Intl.DateTimeFormat('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' })

const statusMap: Record<string, { label: string; tone: 'success' | 'pending' | 'sand' | 'danger' | 'cobalt' }> = {
  pending_payment: { label: 'بانتظار الدفع', tone: 'pending' },
  awaiting_review: { label: 'قيد المراجعة', tone: 'cobalt' },
  paid: { label: 'مدفوع', tone: 'success' },
  expired: { label: 'منتهي', tone: 'sand' },
  cancelled: { label: 'ملغي', tone: 'sand' },
  refunded: { label: 'مسترد', tone: 'danger' },
}

export default async function MyOrdersPage() {
  const orders = await getMyOrders()

  return (
    <div className="mx-auto max-w-4xl">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-deep-teal">طلباتي</h1>
        <p className="mt-1 text-text-soft">سجل مشترياتك وحالة كل طلب.</p>
      </header>

      {orders.length === 0 ? (
        <EmptyState
          title="لا طلبات بعد"
          description="كل عملية شراء تظهر هنا بحالتها — من إنشاء الطلب حتى تفعيل الوصول."
          actionLabel="استكشفي الدورات"
          actionHref="/courses"
        />
      ) : (
        <Table>
          <THead>
            <tr>
              <TH>المنتج</TH>
              <TH>التاريخ</TH>
              <TH>الإجمالي</TH>
              <TH>الحالة</TH>
            </tr>
          </THead>
          <TBody>
            {orders.map((o) => {
              const expired = o.status === 'pending_payment' && isPast(o.expiresAt)
              const st = expired ? statusMap.expired : (statusMap[o.status] ?? statusMap.pending_payment)
              return (
                <TR key={o.id}>
                  <TD className="font-semibold text-deep-teal">
                    {o.productTitles.length > 0 ? o.productTitles.join(' + ') : 'طلب شراء'}
                  </TD>
                  <TD>{dateFmt.format(new Date(o.createdAt))}</TD>
                  <TD>{formatPrice(o.total)}</TD>
                  <TD>
                    <Badge tone={st.tone}>{st.label}</Badge>
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
