import { getHomeData } from '@/lib/data/home'
import { Hero } from '@/components/home/Hero'
import { TrustStrip } from '@/components/home/TrustStrip'
import { ServiceCards } from '@/components/home/ServiceCards'
import { OfferBlock } from '@/components/home/OfferBlock'
import { FeaturedArticles } from '@/components/home/FeaturedArticles'
import { Testimonials } from '@/components/home/Testimonials'
import { Reveal } from '@/components/ui/Reveal'
import { getHomeCopy } from '@/lib/data/cms'
import { JourneyMap } from '@/components/home/JourneyMap'
import { EditorialFeature } from '@/components/home/EditorialFeature'

export const revalidate = 300

export default async function HomePage() {
  const [{ offer, articles, testimonials }, copy] = await Promise.all([getHomeData(), getHomeCopy()])

  return (
    <main>
      <Hero copy={copy} />
      <Reveal>
        <TrustStrip />
      </Reveal>
      <Reveal>
        <ServiceCards />
      </Reveal>
      <Reveal>
        <JourneyMap />
      </Reveal>
      <Reveal>
        <EditorialFeature />
      </Reveal>
      <Reveal>
        <OfferBlock offer={offer} />
      </Reveal>
      <Reveal>
        <FeaturedArticles articles={articles} />
      </Reveal>
      <Reveal>
        <Testimonials testimonials={testimonials} />
      </Reveal>
    </main>
  )
}
