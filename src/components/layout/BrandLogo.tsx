import Link from 'next/link'
import { cn } from '@/lib/cn'
import { SeedMark, SeedMarkLight } from './SeedMark'

// Official brand lockup: «بذرة نقية» seed mark + wordmark.
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
  const Mark = tone === 'dark' ? SeedMark : SeedMarkLight
  return (
    <Link href={href} className={cn('group flex items-center gap-3', className)} aria-label="هبة الشريف — الصفحة الرئيسية">
      <Mark className="h-10 w-auto transition-transform duration-300 group-hover:scale-105" />
      <span className="flex flex-col leading-tight">
        <span className={cn('font-heading text-xl font-bold', main)}>هبة الشريف</span>
        <span className="text-[11px] tracking-widest text-antique-gold">منصة التعلّم والتطوير</span>
      </span>
    </Link>
  )
}
