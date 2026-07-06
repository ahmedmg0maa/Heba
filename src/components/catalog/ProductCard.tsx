import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Stars } from './Stars'
import { formatPrice } from '@/lib/data/catalog'
import { cn } from '@/lib/cn'

type ProductCardProps = {
  href: string
  title: string
  subtitle?: string
  description: string
  price: number
  compareAtPrice?: number | null
  badge?: { label: string; tone?: 'gold' | 'burgundy' | 'teal' | 'cobalt' }
  rating?: { value: number; count: number }
  meta?: string[]
  coverKind?: 'course' | 'book' | 'workshop' | 'session'
  ctaLabel?: string
}

// Branded cover substitute per product kind (awaiting real photography — KNOWN_ISSUES #1)
const coverArt: Record<NonNullable<ProductCardProps['coverKind']>, { bg: string; glyph: React.ReactNode }> = {
  course: {
    bg: 'from-deep-teal to-teal-hover',
    glyph: <path d="M8 10h24v15H8zM14 30h12M20 25v5M14 15h12M14 19h8" strokeLinecap="round" strokeLinejoin="round" />,
  },
  book: {
    bg: 'from-burgundy to-burgundy-soft',
    glyph: <path d="M8 10a3 3 0 0 1 3-3h21v22H11a3 3 0 0 0-3 3ZM8 10v22M32 29v4H11" strokeLinecap="round" strokeLinejoin="round" />,
  },
  workshop: {
    bg: 'from-antique-gold to-muted-gold',
    glyph: <path d="M20 7v4M9.7 9.7l2.8 2.8M7 20h4M9.7 30.3l2.8-2.8M20 33v-4M30.3 30.3l-2.8-2.8M33 20h-4M30.3 9.7l-2.8 2.8M20 15a5 5 0 1 0 5 5" strokeLinecap="round" strokeLinejoin="round" />,
  },
  session: {
    bg: 'from-cobalt to-deep-teal',
    glyph: <path d="M20 20a6 6 0 1 0-6-6 6 6 0 0 0 6 6Zm-11 14c0-6 4.9-11 11-11s11 5 11 11" strokeLinecap="round" strokeLinejoin="round" />,
  },
}

export function ProductCard({
  href,
  title,
  subtitle,
  description,
  price,
  compareAtPrice,
  badge,
  rating,
  meta,
  coverKind = 'course',
  ctaLabel = 'اعرفي التفاصيل',
}: ProductCardProps) {
  const art = coverArt[coverKind]
  return (
    <Card hover as="article" className="group flex flex-col overflow-hidden p-0">
      <div className={cn('relative flex h-40 items-center justify-center bg-linear-to-br', art.bg)}>
        <svg viewBox="0 0 40 40" className="h-16 w-16 text-soft-white/85" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
          {art.glyph}
        </svg>
        {badge && (
          <Badge tone={badge.tone ?? 'gold'} className="absolute end-4 top-4 bg-soft-white/95 shadow-card">
            {badge.label}
          </Badge>
        )}
      </div>
      <div className="flex flex-1 flex-col p-6">
        {subtitle && <p className="mb-1 text-xs font-semibold tracking-wide text-antique-gold">{subtitle}</p>}
        <h3 className="text-xl font-bold text-deep-teal">
          <Link href={href} className="transition-colors hover:text-burgundy">
            {title}
          </Link>
        </h3>
        {rating && rating.count > 0 && <Stars rating={rating.value} count={rating.count} className="mt-2" />}
        <p className="mt-3 flex-1 text-sm leading-relaxed text-text-soft">{description}</p>
        {meta && meta.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-taupe">
            {meta.map((m) => (
              <li key={m} className="flex items-center gap-1.5">
                <span className="h-1 w-1 rounded-full bg-antique-gold" aria-hidden />
                {m}
              </li>
            ))}
          </ul>
        )}
        <div className="mt-5 flex items-center justify-between border-t border-line pt-4">
          <p className="flex items-baseline gap-2">
            <span className="tnum text-lg font-bold text-burgundy">{formatPrice(price)}</span>
            {compareAtPrice && (
              <span className="tnum text-sm text-taupe line-through">{formatPrice(compareAtPrice)}</span>
            )}
          </p>
          <Link href={href} className="text-sm font-semibold text-deep-teal transition-colors group-hover:text-burgundy">
            {ctaLabel}
          </Link>
        </div>
      </div>
    </Card>
  )
}
