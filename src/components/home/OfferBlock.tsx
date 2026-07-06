import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Countdown } from '@/components/ui/Countdown'
import type { HomeOffer } from '@/lib/data/home'

export function OfferBlock({ offer }: { offer: HomeOffer | null }) {
  if (!offer?.endsAt) return null
  const endsAt = offer.endsAt

  return (
    <section className="bg-deep-teal px-6 py-16 text-soft-white md:py-20">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-8 text-center">
        {offer.badgeText && (
          <Badge tone="gold" className="bg-antique-gold/20 px-4 py-1.5 text-sm text-muted-gold">
            {offer.badgeText}
          </Badge>
        )}
        <h2 className="text-3xl font-bold md:text-4xl">{offer.title}</h2>
        <p className="max-w-xl text-lg leading-loose text-soft-white/80">{offer.description}</p>
        <Countdown target={endsAt} tone="dark" />
        <Button href="/courses" variant="gold" size="lg">
          استفيدي من العرض الآن
        </Button>
      </div>
    </section>
  )
}
