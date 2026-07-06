import type { Metadata } from 'next'
import { getMyBookings } from '@/lib/data/dashboard'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'

export const metadata: Metadata = { title: 'حجوزاتي' }

const dateFmt = new Intl.DateTimeFormat('ar-EG', { weekday: 'long', day: 'numeric', month: 'long', hour: 'numeric', minute: '2-digit' })

const statusMap: Record<string, { label: string; tone: 'success' | 'pending' | 'sand' | 'danger' }> = {
  pending: { label: 'بانتظار التأكيد', tone: 'pending' },
  confirmed: { label: 'مؤكد', tone: 'success' },
  completed: { label: 'مكتملة', tone: 'sand' },
  cancelled: { label: 'ملغاة', tone: 'danger' },
  no_show: { label: 'لم يتم الحضور', tone: 'danger' },
}

export default async function MyBookingsPage() {
  const bookings = await getMyBookings()

  return (
    <div className="mx-auto max-w-4xl">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-deep-teal">حجوزاتي</h1>
        <p className="mt-1 text-text-soft">جلساتك الفردية القادمة والسابقة.</p>
      </header>

      {bookings.length === 0 ? (
        <EmptyState
          title="لا حجوزات بعد"
          description="جلسة الوضوح الفردية: ٦٠ دقيقة لك وحدك تخرجين منها بخطة واضحة."
          actionLabel="احجزي جلستك الأولى"
          actionHref="/booking"
        />
      ) : (
        <div className="space-y-5">
          {bookings.map((b) => {
            const st = statusMap[b.status] ?? statusMap.pending
            return (
              <Card key={b.id} className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-bold text-deep-teal">{b.serviceTitle}</h2>
                    <Badge tone={st.tone}>{st.label}</Badge>
                  </div>
                  <p className="tnum mt-1 text-sm text-taupe">{dateFmt.format(new Date(b.startsAt))}</p>
                </div>
                {b.status === 'confirmed' && b.meetingUrl && (
                  <Button href={b.meetingUrl} target="_blank" variant="secondary" size="sm" className="shrink-0">
                    رابط الجلسة
                  </Button>
                )}
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
