import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getServerClient } from '@/lib/supabase/server'
import { Card, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { ModuleForm, LessonForm } from '@/components/admin/CurriculumForms'

export const metadata: Metadata = { title: 'منشئ المنهج — الإدارة' }

type Props = { params: Promise<{ id: string }> }

const hasEnv = () =>
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

export default async function CurriculumBuilderPage({ params }: Props) {
  const { id } = await params

  if (!hasEnv()) {
    return (
      <div className="mx-auto max-w-xl py-16">
        <EmptyState
          title="منشئ المنهج يتطلب قاعدة البيانات"
          description="اربطي مشروع Supabase وستتمكنين من بناء الوحدات والدروس من هنا."
          actionLabel="عودة للدورات"
          actionHref="/admin/courses"
        />
      </div>
    )
  }

  const supabase = await getServerClient()
  const { data: course } = await supabase
    .from('courses')
    .select('id, title, course_modules(id, title, sort, course_lessons(id, title, duration_seconds, sort, is_preview, video_path))')
    .eq('id', id)
    .maybeSingle()
  if (!course) notFound()

  const modules = (course.course_modules ?? []).sort((a, b) => a.sort - b.sort)

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <header>
        <Link href="/admin/courses" className="text-sm font-semibold text-antique-gold hover:text-burgundy">
          الدورات
        </Link>
        <h1 className="mt-1 text-3xl font-bold text-deep-teal">منهج: {course.title}</h1>
        <p className="mt-1 text-text-soft">أضيفي الوحدات ثم الدروس داخل كل وحدة — الترتيب تلقائي بالإضافة.</p>
      </header>

      <Card className="p-6">
        <ModuleForm courseId={course.id} />
      </Card>

      {modules.length === 0 ? (
        <EmptyState title="لا وحدات بعد" description="ابدئي بإضافة الوحدة الأولى من النموذج أعلاه." />
      ) : (
        <div className="space-y-6">
          {modules.map((m) => (
            <Card key={m.id} className="space-y-4">
              <CardTitle>{m.title}</CardTitle>
              {(m.course_lessons ?? []).length > 0 && (
                <ul className="divide-y divide-line/70 rounded-xl border border-line">
                  {m.course_lessons
                    .sort((a, b) => a.sort - b.sort)
                    .map((l) => (
                      <li key={l.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                        <span className="flex items-center gap-2 text-ink">
                          {l.title}
                          {l.is_preview && <Badge tone="cobalt">معاينة</Badge>}
                          {!l.video_path && <Badge tone="pending">بلا فيديو</Badge>}
                        </span>
                        <span className="tnum text-taupe">
                          {Math.round(l.duration_seconds / 60).toLocaleString('ar-EG')} د
                        </span>
                      </li>
                    ))}
                </ul>
              )}
              <LessonForm moduleId={m.id} courseId={course.id} />
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
