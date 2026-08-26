import type { Metadata } from 'next'
import { getMyPayments, type MyPayment } from '@/lib/data/dashboard'
import { formatPrice } from '@/lib/data/catalog'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { ResubmitProof } from '@/components/dashboard/ResubmitProof'
import { isPast } from '@/lib/format'
import { cn } from '@/lib/cn'

export const metadata: Metadata = { title: 'مدفوعاتي' }

const methodLabels: Record<string, string> = {
  instapay: 'إنستاباي',
  wallet: 'محفظة إلكترونية',
  bank_transfer: 'تحويل بنكي',
}

const dateFmt = new Intl.DateTimeFormat('ar-EG', {
  day: 'numeric',
  month: 'long',
  hour: 'numeric',
  minute: '2-digit',
})

function statusBadge(p: MyPayment) {
  if (p.status === 'approved') return <Badge tone="success">مقبول — تم تفعيل الوصول</Badge>
  if (p.status === 'rejected') return <Badge tone="danger">مرفوض</Badge>
  if (p.orderExpiresAt && new Date(p.orderExpiresAt).getTime() < Date.now() && p.orderStatus === 'pending_payment')
    return <Badge tone="sand">منتهي الصلاحية</Badge>
  return <Badge tone="pending">قيد المراجعة</Badge>
}

function Timeline({ p }: { p: MyPayment }) {
  const steps: { label: string; time: string | null; state: 'done' | 'bad' | 'wait' }[] = [
    { label: 'أُرسل الإيصال', time: p.createdAt, state: 'done' },
  ]
  if (p.status === 'approved') {
    steps.push({ label: 'اعتُمد الدفع وفُعّل الوصول', time: p.reviewedAt, state: 'done' })
  } else if (p.status === 'rejected') {
    steps.push({ label: `رُفض الدفع${p.rejectReason ? ` — ${p.rejectReason}` : ''}`, time: p.reviewedAt, state: 'bad' })
    steps.push({ label: 'يمكنك رفع إيصال جديد من صفحة طلباتك', time: null, state: 'wait' })
  } else {
    steps.push({ label: 'قيد مراجعة الفريق ضمن أوقات العمل', time: null, state: 'wait' })
  }
  return (
    <ol className="mt-4 space-y-3 border-t border-line pt-4">
      {steps.map((s) => (
        <li key={s.label} className="flex items-start gap-3 text-sm">
          <span
            className={cn(
              'mt-1 h-2.5 w-2.5 shrink-0 rounded-full',
              s.state === 'done' && 'bg-deep-teal',
              s.state === 'bad' && 'bg-burgundy',
              s.state === 'wait' && 'border border-taupe bg-transparent',
            )}
            aria-hidden
          />
          <span className={cn(s.state === 'wait' ? 'text-taupe' : 'text-ink')}>
            {s.label}
            {s.time && <time className="tnum ms-2 text-xs text-taupe">{dateFmt.format(new Date(s.time))}</time>}
          </span>
        </li>
      ))}
    </ol>
  )
}

export default async function PaymentsPage() {
  const payments = await getMyPayments()

  return (
    <div className="mx-auto max-w-3xl">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-deep-teal">مدفوعاتي</h1>
        <p className="mt-1 text-text-soft">تابعي حالة كل دفعة من الإرسال حتى تفعيل الوصول.</p>
      </header>

      {payments.length === 0 ? (
        <EmptyState
          title="لا توجد مدفوعات بعد"
          description="حين تشترين دورة أو كتابًا أو تحجزين جلسة ستظهر حالة الدفع هنا خطوة بخطوة."
          actionLabel="استكشفي الدورات"
          actionHref="/courses"
        />
      ) : (
        <div className="space-y-5">
          {payments.map((p) => (
            <Card key={p.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-bold text-deep-teal">
                    {p.productTitles.length > 0 ? p.productTitles.join(' + ') : 'طلب شراء'}
                  </h2>
                  <p className="tnum mt-1 text-sm text-taupe">
                    {methodLabels[p.method] ?? p.method} · {formatPrice(p.amount)}
                  </p>
                </div>
                {statusBadge(p)}
              </div>
              <Timeline p={p} />
              {p.status === 'rejected' && p.orderStatus === 'pending_payment' && !isPast(p.orderExpiresAt) && (
                <ResubmitProof orderId={p.orderId} method={p.method} />
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
