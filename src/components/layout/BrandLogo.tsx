import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/cn'

// The owner-supplied artwork is the canonical brand mark. Keeping it as an
// image preserves every calligraphic detail instead of approximating it in SVG.
export function BrandLogo({
  tone = 'dark',
  href = '/',
  className,
}: {
  tone?: 'dark' | 'light'
  href?: string
  className?: string
}) {
  return (
    <Link
      href={href}
      className={cn(
        'group relative block h-14 w-14 shrink-0 overflow-hidden rounded-2xl border shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-card',
        tone === 'light'
          ? 'border-on-dark/20 bg-[#f8f0e7] ring-1 ring-on-dark/8'
          : 'border-antique-gold/25 bg-[#f8f0e7] ring-1 ring-deep-teal/5',
        className,
      )}
      aria-label="هبة الشريف — الصفحة الرئيسية"
    >
      <Image
        src="/brand/main-logo.png"
        alt="شعار هبة الشريف"
        width={1254}
        height={1254}
        priority
        unoptimized
        sizes="56px"
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
      />
    </Link>
  )
}
