import type { Metadata } from 'next'
import Link from 'next/link'
import { PageHero } from '@/components/catalog/PageHero'
import { Section } from '@/components/ui/Section'
import { Card } from '@/components/ui/Card'
import { CTARibbon } from '@/components/catalog/CTARibbon'

export const metadata: Metadata = {
  title: 'ابدئي من هنا',
  description: 'دليلك المختصر لاختيار نقطة البداية الأنسب لك في المنصة.',
}

const paths = [
  {
    title: 'أشعر بالاستنزاف ولا أعرف من أين أبدأ',
    text: 'ابدئي برحلة العناية الواعية بالذات — البرنامج التأسيسي الذي يعيد ترتيب علاقتك بنفسك.',
    href: '/courses/conscious-selfcare',
    cta: 'اذهبي للدورة',
  },
  {
    title: 'أعاني من قول «لا» ومن حدود مهزوزة',
    text: 'دورة فن الحدود الهادئة مصممة خصيصًا لهذا — قوالب حوار جاهزة وتمارين واقعية.',
    href: '/courses/calm-boundaries',
    cta: 'اذهبي للدورة',
  },
  {
    title: 'أفضّل البدء بشيء صغير وخفيف',
    text: 'كتاب صباح الوعي: ٩٠ تأملًا صباحيًا قصيرًا — ٥ دقائق يوميًا تكفي.',
    href: '/books/sabah-alwaey',
    cta: 'اذهبي للكتاب',
  },
  {
    title: 'أحتاج من يسمعني ويساعدني أرتب أفكاري',
    text: 'جلسة الوضوح الفردية: ٦٠ دقيقة لك وحدك، تخرجين منها بخطة واضحة.',
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
        lead="اختاري الجملة الأقرب لحالك اليوم، وسنرشدك لنقطة البداية الأنسب."
      />

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
        lead="راسلينا وسنقترح عليك نقطة البداية الأنسب — بلا أي التزام."
        ctaLabel="تواصلي معنا"
        ctaHref="/contact"
      />
    </main>
  )
}
