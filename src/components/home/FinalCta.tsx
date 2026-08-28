import Image from 'next/image'
import { Button } from '@/components/ui/Button'
import { DEFAULT_HOME_CONTENT, type CtaContent } from '@/lib/home/sections'

export function FinalCta({ content = DEFAULT_HOME_CONTENT.cta as CtaContent }: { content?: CtaContent }) {
  return (
    <section className="relative isolate overflow-hidden border-t border-on-dark/12 bg-[#082730] px-5 py-18 text-on-dark sm:px-8 md:py-24" aria-labelledby="home-final-cta-title">
      <Image src="/images/experience/editorial-reflection-studio.webp" alt="" fill unoptimized sizes="100vw" className="-z-20 object-cover" />
      <span className="absolute inset-0 -z-10 bg-[#082730]/84 backdrop-blur-[1px]" aria-hidden />
      <span className="pointer-events-none absolute inset-5 rounded-[2rem] border border-on-dark/15 sm:inset-8" aria-hidden />
      <div className="relative mx-auto max-w-4xl text-center">
        <p className="text-xs font-bold tracking-[.18em] text-aqua">{content.eyebrow}</p>
        <h2 id="home-final-cta-title" className="mt-3 text-3xl font-bold leading-snug text-on-dark sm:text-5xl">{content.heading}</h2>
        <p className="mx-auto mt-4 max-w-2xl leading-loose text-on-dark/74">{content.body}</p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Button href={content.primaryHref} size="lg">{content.primaryLabel}</Button>
          <Button href={content.secondaryHref} variant="secondary" size="lg">{content.secondaryLabel}</Button>
        </div>
      </div>
    </section>
  )
}
