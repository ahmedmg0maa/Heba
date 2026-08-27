import type { HomeData } from '@/lib/data/home'
import type { HomeCopy } from '@/lib/data/cms'
import type { ArticlesContent, CtaContent, EditorialFeatureContent, GuidedStartContent, HomeSection, PathwaysContent, TestimonialsContent, TrustContent } from '@/lib/home/sections'
import { Hero } from '@/components/home/Hero'
import { TrustStrip } from '@/components/home/TrustStrip'
import { ServiceCards } from '@/components/home/ServiceCards'
import { JourneyMap } from '@/components/home/JourneyMap'
import { EditorialFeature } from '@/components/home/EditorialFeature'
import { OfferBlock } from '@/components/home/OfferBlock'
import { FeaturedArticles } from '@/components/home/FeaturedArticles'
import { Testimonials } from '@/components/home/Testimonials'
import { FinalCta } from '@/components/home/FinalCta'
import { Reveal } from '@/components/ui/Reveal'

export function HomeSectionRenderer({ section, copy, data }: { section: HomeSection; copy: HomeCopy; data: HomeData }) {
  if (section.kind === 'hero') return <Hero copy={copy} />
  let content: React.ReactNode = null
  if (section.kind === 'trust') content = <TrustStrip content={section.content as TrustContent} />
  else if (section.kind === 'pathways') content = <ServiceCards content={section.content as PathwaysContent} />
  else if (section.kind === 'guided_start') content = <JourneyMap content={section.content as GuidedStartContent} />
  else if (section.kind === 'editorial_feature') content = <EditorialFeature content={section.content as EditorialFeatureContent} />
  else if (section.kind === 'offer') content = <OfferBlock offer={data.offer} ctaLabel={(section.content as { ctaLabel: string }).ctaLabel} />
  else if (section.kind === 'articles') content = <FeaturedArticles articles={data.articles} content={section.content as ArticlesContent} />
  else if (section.kind === 'testimonials') content = <Testimonials testimonials={data.testimonials} content={section.content as TestimonialsContent} />
  else if (section.kind === 'cta') content = <FinalCta content={section.content as CtaContent} />
  return content ? <Reveal>{content}</Reveal> : null
}
