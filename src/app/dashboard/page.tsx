import type { Metadata } from 'next'
import Link from 'next/link'
import {
  getMyProfile,
  getMyCourses,
  getMyBooks,
  getMyBookings,
  getMyNotifications,
} from '@/lib/data/dashboard'
import { isFuture } from '@/lib/format'
import { StatCard } from '@/components/ui/StatCard'
import { Card, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { Badge } from '@/components/ui/Badge'

export const metadata: Metadata = { title: 'لوحتي' }

const dateFmt = new Intl.DateTimeFormat('ar-EG', { weekday: 'long', day: 'numeric', month: 'long', hour: 'numeric', minute: '2-digit' })

export default async function DashboardHome() {
  const [profile, courses, books, bookings, notifications] = await Promise.all([
    getMyProfile(),
    getMyCourses(),
    getMyBooks(),
    getMyBookings(),
    getMyNotifications(),
  ])

  const firstName = profile?.fullName?.split(' ')[0] || 'صديقتي'
  const inProgress = courses.filter((c) => c.percent > 0 && c.percent < 100)
  const continueCourse = inProgress[0] ?? courses[0] ?? null
  const upcoming = bookings.find((b) => b.status !== 'cancelled' && isFuture(b.startsAt))
  const unread = notifications.filter((n) => !n.readAt).length

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-deep-teal">أهلًا {firstName} 🌿</h1>
        <p className="mt-1 text-text-soft">سعداء بعودتك — هذه خلاصة رحلتك اليوم.</p>
      </header>

      <div className="grid gap-5 sm:grid-cols-3">
        <StatCard label="دوراتي" value={courses.length.toLocaleString('ar-EG')} accent="teal" />
        <StatCard label="كتبي" value={books.length.toLocaleString('ar-EG')} accent="burgundy" />
        <StatCard label="إشعارات جديدة" value={unread.toLocaleString('ar-EG')} accent="gold" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardTitle className="mb-4">أكملي التعلّم</CardTitle>
          {continueCourse ? (
            <div className="space-y-4">
              <h3 className="font-bold text-ink">{continueCourse.title}</h3>
              <div>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-taupe">التقدم</span>
                  <span className="tnum font-bold text-deep-teal">{Math.round(continueCourse.percent).toLocaleString('ar-EG')}٪</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-sand/60" role="progressbar" aria-valuenow={Math.round(continueCourse.percent)} aria-valuemin={0} aria-valuemax={100}>
                  <div className="h-full rounded-full bg-deep-teal" style={{ width: `${continueCourse.percent}%` }} />
                </div>
              </div>
              <Button href={`/dashboard/courses/${continueCourse.slug}/learn`}>متابعة الدرس التالي</Button>
            </div>
          ) : (
            <EmptyState
              className="border-0 bg-transparent px-2 py-6"
              title="لم تلتحقي بدورة بعد"
              description="اختاري أولى دوراتك وابدئي رحلتك."
              actionLabel="استكشفي الدورات"
              actionHref="/courses"
            />
          )}
        </Card>

        <Card>
          <CardTitle className="mb-4">موعدك القادم</CardTitle>
          {upcoming ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-bold text-ink">{upcoming.serviceTitle}</h3>
                <Badge tone={upcoming.status === 'confirmed' ? 'success' : 'pending'}>
                  {upcoming.status === 'confirmed' ? 'مؤكد' : 'بانتظار التأكيد'}
                </Badge>
              </div>
              <p className="tnum text-sm text-text-soft">{dateFmt.format(new Date(upcoming.startsAt))}</p>
              {upcoming.meetingUrl && upcoming.status === 'confirmed' && (
                <Button href={upcoming.meetingUrl} target="_blank" variant="secondary" size="sm">
                  رابط الجلسة
                </Button>
              )}
              <Link href="/dashboard/bookings" className="block text-sm font-semibold text-burgundy">
                كل حجوزاتي
              </Link>
            </div>
          ) : (
            <EmptyState
              className="border-0 bg-transparent px-2 py-6"
              title="لا مواعيد قادمة"
              description="احجزي جلسة وضوح فردية حين تحتاجين مساحة خاصة."
              actionLabel="احجزي جلسة"
              actionHref="/booking"
            />
          )}
        </Card>
      </div>
    </div>
  )
}
