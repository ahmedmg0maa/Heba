import type { Metadata } from 'next'
import { getMyOrders } from '@/lib/data/dashboard'
import { formatPrice, isPast } from '@/lib/format'
import { Table, THead, TBody, TR, TH, TD } from '@/components/ui/Table'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { VerifiedReviewForm } from '@/components/dashboard/VerifiedReviewForm'

export const metadata: Metadata = { title: 'طلباتي' }

const dateFmt = new Intl.DateTimeFormat('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' })

const statusMap: Record<string, { label: string; tone: 'success' | 'pending' | 'sand' | 'danger' | 'cobalt' }> = {
  pending_payment: { label: 'بانتظار الدفع', tone: 'pending' },
  awaiting_review: { label: 'قيد المراجعة', tone: 'cobalt' },
  paid: { label: 'مدفوع', tone: 'success' },
  refund_pending: { label: 'الاسترداد قيد التنفيذ', tone: 'cobalt' },
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
        <>
          {/* phones: stacked cards */}
          <ul className="space-y-4 md:hidden">
            {orders.map((o) => {
              const expired = o.status === 'pending_payment' && isPast(o.expiresAt)
              const st = expired ? statusMap.expired : (statusMap[o.status] ?? statusMap.pending_payment)
              return (
                <li key={o.id} className="rounded-2xl border border-line bg-surface-raised p-5 shadow-card">
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="font-semibold text-deep-teal">
                      {o.productTitles.length > 0 ? o.productTitles.join(' + ') : 'طلب شراء'}
                    </h2>
                    <Badge tone={st.tone}>{st.label}</Badge>
                  </div>
                  <p className="tnum mt-3 flex items-center justify-between border-t border-line/70 pt-3 text-sm">
                    <span className="text-taupe">{dateFmt.format(new Date(o.createdAt))}</span>
                    <span className="font-bold text-burgundy">{formatPrice(o.total)}</span>
                  </p>
                  {o.status==='paid'&&o.products.map(product=><VerifiedReviewForm key={product.id} productId={product.id} title={product.title}/>)}
                </li>
              )
            })}
          </ul>

          {/* tablets and up: table */}
          <Table className="hidden md:block">
            <THead>
              <tr>
                <TH>المنتج</TH>
                <TH>التاريخ</TH>
                <TH>الإجمالي</TH>
                <TH>الحالة</TH>
                <TH>التقييم</TH>
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
                    <TD>{o.status==='paid'&&o.products.map(product=><VerifiedReviewForm key={product.id} productId={product.id} title={product.title}/>)}</TD>
                  </TR>
                )
              })}
            </TBody>
          </Table>
        </>
      )}
    </div>
  )
}
