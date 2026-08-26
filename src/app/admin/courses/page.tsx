import type { Metadata } from 'next'
import Link from 'next/link'
import { adminList, getPublicMediaOptions } from '@/lib/data/cms'
import { Table, THead, TBody, TR, TH, TD } from '@/components/ui/Table'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { PublishToggle } from '@/components/admin/AdminControls'
import { CatalogCreatePanel, CatalogEditPanel } from '@/components/admin/CatalogManager'

export const metadata: Metadata = { title: 'الدورات — الإدارة' }

type Row = {
  id: string
  title: string
  slug: string
  is_published: boolean
  course_modules: { id: string; course_lessons: { id: string }[] }[]
  course_enrollments: { id: string }[]
  description: string
  level: string
  duration_minutes: number
  cover_url: string | null
  products: { price: number; compare_at_price: number | null; currency: string; subtitle: string | null; sort: number } | { price: number; compare_at_price: number | null; currency: string; subtitle: string | null; sort: number }[]
}

export default async function AdminCoursesPage() {
  const media = await getPublicMediaOptions()
  const courses = await adminList<Row>(
    'courses',
    'id, title, slug, description, level, duration_minutes, cover_url, is_published, products(price, compare_at_price, currency, subtitle, sort), course_modules(id, course_lessons(id)), course_enrollments(id)',
  )

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-deep-teal">الدورات</h1>
        <p className="mt-1 text-text-soft">المناهج والالتحاقات — «المنهج» يفتح منشئ الوحدات والدروس.</p>
      </header>

      <CatalogCreatePanel kind="course" media={media} />

      {courses.length === 0 ? (
        <EmptyState title="لا دورات بعد" description="أنشئي المنتج والدورة عبر قاعدة البيانات ثم ابني المنهج من هنا." />
      ) : (
        <Table>
          <THead>
            <tr>
              <TH>الدورة</TH>
              <TH>الوحدات</TH>
              <TH>الدروس</TH>
              <TH>الملتحقات</TH>
              <TH>الحالة</TH>
              <TH>الإجراء</TH>
            </tr>
          </THead>
          <TBody>
            {courses.map((c) => {
              const modules = c.course_modules ?? []
              const lessons = modules.reduce((n, m) => n + (m.course_lessons ?? []).length, 0)
              const product = Array.isArray(c.products) ? c.products[0] : c.products
              return (
                <TR key={c.id}>
                  <TD>
                    <p className="font-semibold text-deep-teal">{c.title}</p>
                    <p className="text-xs text-taupe" dir="ltr">/{c.slug}</p>
                  </TD>
                  <TD>{modules.length.toLocaleString('ar-EG')}</TD>
                  <TD>{lessons.toLocaleString('ar-EG')}</TD>
                  <TD>{(c.course_enrollments ?? []).length.toLocaleString('ar-EG')}</TD>
                  <TD>
                    <Badge tone={c.is_published ? 'success' : 'sand'}>{c.is_published ? 'منشورة' : 'مسودة'}</Badge>
                  </TD>
                  <TD>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/courses/${c.id}/curriculum`}
                        className="rounded-full border border-deep-teal/30 px-4 py-1.5 text-sm font-medium text-deep-teal hover:border-deep-teal"
                      >
                        المنهج
                      </Link>
                      <PublishToggle table="courses" id={c.id} published={c.is_published} />
                      <CatalogEditPanel kind="course" media={media} item={{
                        id: c.id, title: c.title, slug: c.slug, description: c.description,
                        price: Number(product?.price ?? 0), compareAtPrice: product?.compare_at_price,
                        currency: product?.currency, subtitle: product?.subtitle, sort: product?.sort,
                        coverUrl: c.cover_url, isPublished: c.is_published, level: c.level,
                        durationMinutes: c.duration_minutes,
                      }} />
                    </div>
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
