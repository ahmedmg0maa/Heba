import Image from 'next/image'
import { Button } from '@/components/ui/Button'
import { BotanicalSpray } from '@/components/layout/BotanicalSpray'
import { DEFAULT_HOME_CONTENT, type EditorialFeatureContent } from '@/lib/home/sections'

export function EditorialFeature({ content = DEFAULT_HOME_CONTENT.editorial_feature as EditorialFeatureContent }: { content?: EditorialFeatureContent }) {
  return (
    <section className="px-4 py-8 sm:px-6 sm:py-12">
      <div className="relative mx-auto grid max-w-7xl overflow-hidden rounded-3xl border border-antique-gold/30 bg-deep-teal shadow-card lg:grid-cols-[1.15fr_.85fr]">
        <div className="relative min-h-72 lg:min-h-[430px]">
          <Image
            src="/brand/catalog-still-life.webp"
            alt="كتب ودفتر ومساحة تعلم هادئة بألوان هوية هبة الشريف"
            fill
            sizes="(min-width: 1024px) 58vw, 100vw"
            className="object-cover"
            style={{ objectPosition: '55% center' }}
          />
          <span className="absolute inset-0 bg-linear-to-t from-deep-teal/45 via-transparent to-transparent lg:bg-linear-to-l" />
        </div>
        <div className="relative flex flex-col justify-center px-6 py-10 text-on-dark sm:px-10 lg:px-12">
          <BotanicalSpray mirrored className="pointer-events-none absolute -bottom-24 -end-20 h-72 text-muted-gold opacity-15" />
          <p className="text-xs font-bold tracking-[.18em] text-antique-gold">{content.eyebrow}</p>
          <h2 className="relative mt-4 text-3xl leading-snug font-bold sm:text-4xl">{content.heading}</h2>
          <p className="relative mt-4 leading-loose text-on-dark/72">
            {content.body}
          </p>
          <div className="relative mt-7 flex flex-wrap gap-3">
            <Button href={content.primaryHref} className="bg-antique-gold text-deep-teal hover:bg-muted-gold">{content.primaryLabel}</Button>
            <Button href={content.secondaryHref} variant="secondary" className="border-on-dark/30 text-on-dark hover:bg-on-dark/10">{content.secondaryLabel}</Button>
          </div>
        </div>
      </div>
    </section>
  )
}
