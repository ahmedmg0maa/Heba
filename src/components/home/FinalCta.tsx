import { Button } from '@/components/ui/Button'
import { DEFAULT_HOME_CONTENT, type CtaContent } from '@/lib/home/sections'

export function FinalCta({ content = DEFAULT_HOME_CONTENT.cta as CtaContent }: { content?: CtaContent }) {
  return (
    <section className="border-t border-line bg-sand/45 px-5 py-14 sm:px-8 md:py-20" aria-labelledby="home-final-cta-title">
      <div className="mx-auto max-w-4xl text-center">
        <p className="text-xs font-bold tracking-[.18em] text-antique-gold">{content.eyebrow}</p>
        <h2 id="home-final-cta-title" className="mt-3 text-3xl font-bold leading-snug text-deep-teal sm:text-4xl">{content.heading}</h2>
        <p className="mx-auto mt-4 max-w-2xl leading-loose text-text-soft">{content.body}</p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Button href={content.primaryHref} size="lg">{content.primaryLabel}</Button>
          <Button href={content.secondaryHref} variant="secondary" size="lg">{content.secondaryLabel}</Button>
        </div>
      </div>
    </section>
  )
}
