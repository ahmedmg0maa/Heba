import type { Metadata } from 'next'
import { getApprovalQueue } from '@/lib/data/admin'
import { formatPrice } from '@/lib/format'
import { Table, THead, TBody, TR, TH, TD } from '@/components/ui/Table'
import { EmptyState } from '@/components/ui/EmptyState'
import { ApprovalActions } from '@/components/admin/ApprovalActions'

export const metadata: Metadata = { title: 'موافقات الدفع — الإدارة' }

const dateFmt = new Intl.DateTimeFormat('ar-EG', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })

const methodLabels: Record<string, string> = {
  instapay: 'إنستاباي',
  wallet: 'محفظة',
  bank_transfer: 'تحويل بنكي',
}

export default async function AdminPaymentsPage() {
  const queue = await getApprovalQueue()

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-deep-teal">موافقات الدفع</h1>
        <p className="mt-1 text-text-soft">
          راجعي الإيصال ثم اعتمدي أو ارفضي — الاعتماد يفعّل وصول العميلة تلقائيًا ويرسل لها إشعارًا.
        </p>
      </header>

      {queue.length === 0 ? (
        <EmptyState
          title="لا مدفوعات بانتظار المراجعة"
          description="حين ترفع عميلة إيصال تحويل يظهر هنا فورًا مع كل تفاصيل الطلب."
        />
      ) : (
        <Table>
          <THead>
            <tr>
              <TH>العميلة</TH>
              <TH>المنتج</TH>
              <TH>الوسيلة</TH>
              <TH>المبلغ</TH>
              <TH>أُرسل</TH>
              <TH>الإجراء</TH>
            </tr>
          </THead>
          <TBody>
            {queue.map((a) => (
              <TR key={a.paymentId}>
                <TD>
                  <p className="font-semibold text-deep-teal">{a.customerName}</p>
                  <p dir="ltr" className="text-xs text-taupe">{a.customerEmail}</p>
                </TD>
                <TD className="max-w-52">
                  <span className="line-clamp-2">{a.productTitles.join(' + ') || '—'}</span>
                </TD>
                <TD>{methodLabels[a.method] ?? a.method}</TD>
                <TD className="font-bold">{formatPrice(a.amount)}</TD>
                <TD>{dateFmt.format(new Date(a.createdAt))}</TD>
                <TD>
                  <ApprovalActions paymentId={a.paymentId} hasProof={Boolean(a.proofPath)} />
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      )}
    </div>
  )
}
