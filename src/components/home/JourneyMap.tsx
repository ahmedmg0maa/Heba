import Link from 'next/link'
import { Section } from '@/components/ui/Section'
import { ComparisonPanel } from '@/components/catalog/ComparisonPanel'
import { DEFAULT_HOME_CONTENT, type GuidedStartContent } from '@/lib/home/sections'

const numbers = ['١', '٢', '٣']

export function JourneyMap({ content = DEFAULT_HOME_CONTENT.guided_start as GuidedStartContent }: { content?: GuidedStartContent }) {
  return (
    <>
      <Section tone="white" eyebrow={content.eyebrow} title={content.heading} lead={content.lead}>
        <ol className="grid gap-5 md:grid-cols-3">
          {content.steps.map((step, index) => (
            <li key={`${step.href}-${index}`} className="relative rounded-xl border border-antique-gold/25 bg-ivory/55 p-6 text-center">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-antique-gold/35 bg-surface-raised font-heading text-xl font-bold text-antique-gold">{numbers[index]}</span>
              <h3 className="mt-4 text-xl font-bold text-deep-teal">{step.title}</h3>
              <p className="mt-2 text-sm leading-loose text-text-soft">{step.text}</p>
              <Link href={step.href} className="mt-4 inline-block text-sm font-bold text-burgundy">{step.cta} ←</Link>
            </li>
          ))}
        </ol>
      </Section>
      <Section eyebrow={content.comparisonEyebrow} title={content.comparisonHeading} lead={content.comparisonLead}>
        <ComparisonPanel />
      </Section>
    </>
  )
}
