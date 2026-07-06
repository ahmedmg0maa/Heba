import type { Metadata } from 'next'
import { getMyCourses } from '@/lib/data/dashboard'
import { formatDuration } from '@/lib/format'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'

export const metadata: Metadata = { title: 'دوراتي' }

export default async function MyCoursesPage() {
  const courses = await getMyCourses()

  return (
    <div className="mx-auto max-w-4xl">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-deep-teal">دوراتي</h1>
        <p className="mt-1 text-text-soft">كل دوراتك في مكان واحد — أكملي من حيث توقفتِ.</p>
      </header>

      {courses.length === 0 ? (
        <EmptyState
          title="لم تلتحقي بأي دورة بعد"
          description="حين تشترين دورة وتُعتمد دفعتك ستظهر هنا مع تقدمك خطوة بخطوة."
          actionLabel="استكشفي الدورات"
          actionHref="/courses"
        />
      ) : (
        <div className="space-y-5">
          {courses.map((c) => (
            <Card key={c.slug} hover className="flex flex-col gap-5 md:flex-row md:items-center">
              <div className="flex-1">
                <h2 className="text-xl font-bold text-deep-teal">{c.title}</h2>
                <p className="tnum mt-1 text-sm text-taupe">
                  {c.lessonsCount.toLocaleString('ar-EG')} درسًا · {formatDuration(c.durationMinutes)}
                </p>
                <div className="mt-4 max-w-md">
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="text-taupe">التقدم</span>
                    <span className="tnum font-bold text-deep-teal">{Math.round(c.percent).toLocaleString('ar-EG')}٪</span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-sand/60" role="progressbar" aria-valuenow={Math.round(c.percent)} aria-valuemin={0} aria-valuemax={100}>
                    <div className="h-full rounded-full bg-deep-teal" style={{ width: `${c.percent}%` }} />
                  </div>
                </div>
              </div>
              <Button href={`/dashboard/courses/${c.slug}/learn`} className="shrink-0 self-start md:self-center">
                {c.percent === 0 ? 'ابدئي الدورة' : c.percent >= 100 ? 'راجعي الدورة' : 'أكملي التعلّم'}
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
