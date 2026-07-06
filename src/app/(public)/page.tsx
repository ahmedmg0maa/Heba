import { getHomeData } from '@/lib/data/home'
import { Hero } from '@/components/home/Hero'
import { TrustStrip } from '@/components/home/TrustStrip'
import { ServiceCards } from '@/components/home/ServiceCards'
import { OfferBlock } from '@/components/home/OfferBlock'
import { FeaturedArticles } from '@/components/home/FeaturedArticles'
import { Testimonials } from '@/components/home/Testimonials'
import { Newsletter } from '@/components/home/Newsletter'

export const revalidate = 300

export default async function HomePage() {
  const { offer, articles, testimonials } = await getHomeData()

  return (
    <main>
      <Hero />
      <TrustStrip />
      <ServiceCards />
      <OfferBlock offer={offer} />
      <FeaturedArticles articles={articles} />
      <Testimonials testimonials={testimonials} />
      <Newsletter />
    </main>
  )
}
