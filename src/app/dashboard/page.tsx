import type { Metadata } from 'next'
import Link from 'next/link'
import {
  getMyProfile,
  getMyCourses,
  getMyBooks,
  getMyBookings,
  getMyOrders,
  getMyNotifications,
  getMyStreak,
  getMyAchievements,
} from '@/lib/data/dashboard'
import { formatPrice, isFuture } from '@/lib/format'
import { StatCard } from '@/components/ui/StatCard'
import { Card, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { Badge } from '@/components/ui/Badge'

export const metadata: Metadata = { title: 'لوحتي' }

const dateFmt = new Intl.DateTimeFormat('ar-EG', { weekday: 'long', day: 'numeric', month: 'long', hour: 'numeric', minute: '2-digit' })

export default async function DashboardHome() {
  const [profile, courses, books, bookings, orders, notifications, streak, achievements] = await Promise.all([
    getMyProfile(),
    getMyCourses(),
    getMyBooks(),
    getMyBookings(),
    getMyOrders(),
    getMyNotifications(),
    getMyStreak(),
    getMyAchievements(),
  ])

  const firstName = profile?.fullName?.split(' ')[0] || 'صديقتي'
  const inProgress = courses.filter((c) => c.percent > 0 && c.percent < 100)
  const continueCourse = inProgress[0] ?? courses[0] ?? null
  const upcoming = bookings.find((b) => b.status !== 'cancelled' && isFuture(b.startsAt))
  const pendingOrder = orders.find((order) => order.status === 'pending_payment' || order.status === 'awaiting_review')
  const unread = notifications.filter((n) => !n.readAt).length

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <header>
        <h1 className="text-4xl font-bold text-deep-teal">لوحة المتعلّمة</h1>
        <p className="mt-1 font-semibold text-burgundy">أهلًا {firstName}، رحلتك مستمرة بخطوات هادئة.</p>
      </header>

      <div className="grid gap-5 sm:grid-cols-3">
        <StatCard label="دوراتي" value={courses.length.toLocaleString('ar-EG')} accent="teal" />
        <StatCard label="كتبي" value={books.length.toLocaleString('ar-EG')} accent="burgundy" />
        <StatCard label="إشعارات جديدة" value={unread.toLocaleString('ar-EG')} accent="gold" />
      </div>

      {pendingOrder && (
        <Card className="flex flex-col gap-4 border-antique-gold/50 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2" role="status">
              <h2 className="font-bold text-deep-teal">
                {pendingOrder.status === 'awaiting_review' ? 'دفعتك قيد المراجعة' : 'طلب ينتظر إثبات الدفع'}
              </h2>
              <Badge tone={pendingOrder.status === 'awaiting_review' ? 'cobalt' : 'pending'}>
                {formatPrice(pendingOrder.total)}
              </Badge>
            </div>
            <p className="text-sm text-text-soft">
              {pendingOrder.productTitles.length > 0 ? pendingOrder.productTitles.join(' + ') : 'طلب شراء'}
            </p>
          </div>
          <Button href={pendingOrder.status === 'awaiting_review' ? '/dashboard/payments' : '/dashboard/orders'} variant="secondary" size="sm">
            {pendingOrder.status === 'awaiting_review' ? 'متابعة المراجعة' : 'إكمال الخطوة التالية'}
          </Button>
        </Card>
      )}

      {/* Learning streak (S4) */}
      <Card className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="font-bold text-deep-teal">سلسلة التعلّم</h2>
          <p className="mt-1 text-sm text-text-soft">
            {streak.count > 0
              ? `${streak.count.toLocaleString('ar-EG')} ${streak.count === 1 ? 'يوم' : 'أيام'} متتالية — استمري 🔥`
              : 'أكملي درسًا اليوم لتبدئي سلسلتك'}
          </p>
        </div>
        <div className="flex items-center gap-2" role="img" aria-label={`نشاط آخر ٧ أيام: ${streak.days.filter(Boolean).length} أيام نشطة`}>
          {streak.days.map((active, i) => (
            <span
              key={i}
              className={
                active
                  ? 'h-3.5 w-3.5 rounded-full bg-antique-gold shadow-card'
                  : 'h-3.5 w-3.5 rounded-full border border-sand bg-transparent'
              }
              aria-hidden
            />
          ))}
        </div>
      </Card>

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

      {/* Achievements feed (S4) */}
      <Card>
        <h2 className="mb-4 font-bold text-deep-teal">إنجازاتك</h2>
        {achievements.length === 0 ? (
          <p className="py-4 text-sm text-taupe">
            كل درس تكملينه وكل دورة تتمينها تتحول إلى إنجاز يُحتفى به هنا.
          </p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {achievements.map((a, i) => (
              <li key={a.label + i} className="flex items-center gap-3 rounded-xl bg-ivory/60 px-4 py-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-antique-gold/15 text-lg" aria-hidden>
                  {a.label.slice(-2)}
                </span>
                <div>
                  <p className="text-sm font-bold text-deep-teal">{a.label}</p>
                  <p className="text-xs text-text-soft">{a.detail}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}
