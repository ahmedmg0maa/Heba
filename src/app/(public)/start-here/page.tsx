import type { Metadata } from 'next'
import Link from 'next/link'
import { PageHero } from '@/components/catalog/PageHero'
import { Section } from '@/components/ui/Section'
import { Card } from '@/components/ui/Card'
import { CTARibbon } from '@/components/catalog/CTARibbon'
import { StartHereQuiz } from '@/components/catalog/StartHereQuiz'
import { getStartHereContent } from '@/lib/data/start-here'

export const metadata: Metadata = {
  title: 'ابدئي من هنا',
  description: 'دليلك المختصر لاختيار نقطة البداية الأنسب لك في المنصة.',
}

export default async function StartHerePage() {
  const content = await getStartHereContent()
  return (
    <main>
      <PageHero
        eyebrow={content.hero.eyebrow}
        title={content.hero.title}
        lead={content.hero.lead}
      />

      <section className="bg-ivory px-6 pt-14">
        <StartHereQuiz content={content.quiz} />
      </section>

      <Section>
        <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
          {content.paths.map((p) => (
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
        title={content.closing.title}
        lead={content.closing.lead}
        ctaLabel={content.closing.ctaLabel}
        ctaHref={content.closing.ctaHref}
      />
    </main>
  )
}
