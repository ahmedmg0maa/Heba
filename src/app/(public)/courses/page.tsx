import type { Metadata } from 'next'
import { listCourses, listBooks, listWorkshops, listServices, formatDuration } from '@/lib/data/catalog'
import { lessonsLabel } from '@/lib/format'
import { getHomeData } from '@/lib/data/home'
import { PageHero } from '@/components/catalog/PageHero'
import { CategoryStrip } from '@/components/catalog/CategoryStrip'
import { ProductCard } from '@/components/catalog/ProductCard'
import { ComparisonPanel } from '@/components/catalog/ComparisonPanel'
import { CTARibbon } from '@/components/catalog/CTARibbon'
import { OfferBlock } from '@/components/home/OfferBlock'
import { Testimonials } from '@/components/home/Testimonials'
import { Section } from '@/components/ui/Section'
import { EmptyState } from '@/components/ui/EmptyState'

export const metadata: Metadata = {
  title: 'الدورات التدريبية',
  description: 'برامج تدريبية عربية معمقة بالفيديو مع كراسات عمل وتطبيقات أسبوعية.',
}

export const revalidate = 300

export default async function CoursesPage() {
  const [courses, books, workshops, services, home] = await Promise.all([
    listCourses(),
    listBooks(),
    listWorkshops(),
    listServices(),
    getHomeData(),
  ])

  return (
    <main>
      <PageHero
        eyebrow="الدورات التدريبية"
        title="برامج تمشي معك خطوة بخطوة"
        lead="ليست مجرد فيديوهات — رحلات تعلّم متكاملة بكراسات عمل وتطبيقات أسبوعية ومجتمع يسندك."
      />
      <CategoryStrip
        items={[
          {
            href: '/courses',
            label: 'الدورات',
            count: courses.length,
            icon: <path d="M4 6h16v11H4zM8 21h8M12 17v4" strokeLinecap="round" strokeLinejoin="round" />,
          },
          {
            href: '/books',
            label: 'الكتب',
            count: books.length,
            icon: <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5ZM4 5.5v15" strokeLinecap="round" strokeLinejoin="round" />,
          },
          {
            href: '/workshops',
            label: 'ورش العمل',
            count: workshops.length,
            icon: <path d="M12 3v3M5.6 5.6l2.1 2.1M3 12h3M12 21v-3M21 12h-3M12 9a3 3 0 1 0 3 3" strokeLinecap="round" strokeLinejoin="round" />,
          },
          {
            href: '/booking',
            label: 'الجلسات الفردية',
            count: services.length,
            icon: <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm-7 9c0-3.9 3.1-7 7-7s7 3.1 7 7" strokeLinecap="round" strokeLinejoin="round" />,
          },
        ]}
      />

      <Section eyebrow="اختاري رحلتك" title="الدورات المتاحة">
        {courses.length === 0 && (
          <EmptyState
            title="الدورات قيد الإعداد"
            description="نصمم الآن أولى دوراتنا التدريبية بعناية. سجّلي في الرسالة الأسبوعية ليصلك موعد الإطلاق أولًا — أو ابدئي بجلسة فردية."
            actionLabel="احجزي جلسة فردية"
            actionHref="/booking"
          />
        )}
        <div className="grid gap-8 md:grid-cols-2">
          {courses.map((c) => (
            <ProductCard
              key={c.slug}
              href={`/courses/${c.slug}`}
              title={c.title}
              subtitle={c.subtitle}
              description={c.description}
              price={c.price}
              compareAtPrice={c.compareAtPrice}
              coverKind="course"
              badge={c.compareAtPrice ? { label: 'عرض خاص', tone: 'burgundy' } : undefined}
              rating={{ value: c.rating, count: c.ratingCount }}
              meta={[lessonsLabel(c.lessonsCount), formatDuration(c.durationMinutes), 'وصول مدى الحياة']}
            />
          ))}
        </div>
      </Section>

      <ComparisonPanel />
      <OfferBlock offer={home.offer} />
      <Testimonials testimonials={home.testimonials} />
      <CTARibbon
        title="لستِ متأكدة من أين تبدئين؟"
        lead="احجزي جلسة وضوح فردية ودعينا نرسم خطتك معًا."
        ctaLabel="احجزي جلستك"
        ctaHref="/booking"
      />
    </main>
  )
}
