import type { Metadata } from 'next'
import Link from 'next/link'
import { PageHero } from '@/components/catalog/PageHero'
import { Section } from '@/components/ui/Section'
import { Card } from '@/components/ui/Card'
import { CTARibbon } from '@/components/catalog/CTARibbon'
import { StartHereQuiz } from '@/components/catalog/StartHereQuiz'

export const metadata: Metadata = {
  title: 'ابدئي من هنا',
  description: 'دليلك المختصر لاختيار نقطة البداية الأنسب لك في المنصة.',
}

const paths = [
  {
    title: 'أشعر بالاستنزاف ولا أعرف من أين أبدأ',
    text: 'استعرضي الدورات المنشورة واقرئي وصف كل مسار قبل اختيار ما يناسبك.',
    href: '/courses',
    cta: 'استكشفي الدورات',
  },
  {
    title: 'أعاني من قول «لا» ومن حدود مهزوزة',
    text: 'تصفحي المقالات والدورات المنشورة؛ التفاصيل الفعلية فقط هي ما يظهر قبل الاختيار.',
    href: '/articles',
    cta: 'اقرئي المقالات',
  },
  {
    title: 'أفضّل البدء بشيء صغير وخفيف',
    text: 'تظهر الكتب المنشورة هنا مع وصفها وتفاصيل الوصول الخاصة بكل كتاب.',
    href: '/books',
    cta: 'تصفحي الكتب',
  },
  {
    title: 'أحتاج من يسمعني ويساعدني أرتب أفكاري',
    text: 'تظهر خدمات الجلسات ومواعيدها فقط عند نشرها وتفعيل التوافر من الإدارة.',
    href: '/booking',
    cta: 'احجزي جلستك',
  },
]

export default function StartHerePage() {
  return (
    <main>
      <PageHero
        eyebrow="ابدئي من هنا"
        title="أين أنتِ الآن؟"
        lead="اختاري الجملة الأقرب لحالك اليوم لتحصلي على ترشيح إرشادي لمسار عام، وليس توصية شخصية أو علاجية."
      />

      <section className="bg-ivory px-6 pt-14">
        <StartHereQuiz />
      </section>

      <Section>
        <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
          {paths.map((p) => (
            <Card key={p.href} hover className="group flex flex-col">
              <h2 className="text-xl font-bold leading-relaxed text-deep-teal">«{p.title}»</h2>
              <p className="mt-3 flex-1 leading-relaxed text-text-soft">{p.text}</p>
              <Link href={p.href} className="mt-5 inline-flex items-center gap-2 font-semibold text-burgundy">
                {p.cta}
                <svg viewBox="0 0 20 20" className="h-4 w-4 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                  <path d="M12 5l-5 5 5 5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </Card>
          ))}
        </div>
      </Section>

      <CTARibbon
        title="ما زلتِ محتارة؟"
        lead="استخدمي نموذج التواصل عند تهيئته إذا احتجتِ إلى سؤال عن خدمة منشورة."
        ctaLabel="تواصلي معنا"
        ctaHref="/contact"
      />
    </main>
  )
}
