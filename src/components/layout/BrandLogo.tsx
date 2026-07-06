import Link from 'next/link'
import { cn } from '@/lib/cn'

// SVG monogram + wordmark substitute until /public/brand/logo.svg is provided
// (tracked in docs/KNOWN_ISSUES.md).
export function BrandLogo({
  tone = 'dark',
  href = '/',
  className,
}: {
  tone?: 'dark' | 'light'
  href?: string
  className?: string
}) {
  const main = tone === 'dark' ? 'text-deep-teal' : 'text-soft-white'
  return (
    <Link href={href} className={cn('flex items-center gap-3', className)} aria-label="هبة الشريف — الصفحة الرئيسية">
      <svg viewBox="0 0 44 44" className="h-11 w-11" aria-hidden>
        <circle cx="22" cy="22" r="20.5" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-antique-gold" />
        <circle cx="22" cy="22" r="16.5" fill="none" stroke="currentColor" strokeWidth="0.75" strokeOpacity="0.5" className="text-antique-gold" />
        <text
          x="22"
          y="29"
          textAnchor="middle"
          fontFamily="var(--font-amiri), serif"
          fontSize="19"
          fontWeight="700"
          className={cn('fill-current', main)}
        >
          هـ
        </text>
      </svg>
      <span className="flex flex-col leading-tight">
        <span className={cn('font-heading text-xl font-bold', main)}>هبة الشريف</span>
        <span className="text-[11px] tracking-widest text-antique-gold">منصة التعلّم والتطوير</span>
      </span>
    </Link>
  )
}
