'use client'

import Link from 'next/link'
import { useState, useSyncExternalStore } from 'react'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/cn'
import { Button } from '@/components/ui/Button'
import { BrandLogo } from './BrandLogo'
import { ThemeToggle } from '@/components/theme/ThemeToggle'
import type { PublicNavigationItem } from '@/lib/data/cms'

const allNav = [
  { href: '/', label: 'الرئيسية' },
  { href: '/courses', label: 'الدورات' },
  { href: '/books', label: 'الكتب' },
  { href: '/workshops', label: 'ورش العمل', flag: 'workshops' },
  { href: '/services', label: 'الخدمات' },
  { href: '/articles', label: 'المقالات' },
]

export function PublicHeader({ flags = {}, items = [] }: { flags?: Record<string, boolean>; items?: PublicNavigationItem[] }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const interactive = useSyncExternalStore(() => () => {}, () => true, () => false)
  const nav = (items.length ? items : allNav).filter((item) => !('flag' in item) || !item.flag || flags[item.flag] !== false)

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-ivory/96 backdrop-blur-xl">
      <div className="mx-auto grid h-[68px] max-w-[1440px] grid-cols-[auto_1fr_auto] items-center gap-4 px-4 sm:px-6 lg:h-[72px] lg:px-8">
        <div className="flex items-center gap-2.5">
          <BrandLogo className="h-11 w-11 rounded-xl lg:h-13 lg:w-13" />
          <span className="hidden leading-none sm:block" aria-hidden="true">
            <span className="block font-serif text-lg font-bold text-deep-teal">هبة الشريف</span>
            <span className="mt-1 block text-[8px] font-bold tracking-[0.24em] text-antique-gold" dir="ltr">HEBA ELSHERIF</span>
          </span>
        </div>

        <nav className="hidden justify-self-center lg:block" aria-label="التنقل الرئيسي">
          <ul className="flex items-center gap-1 xl:gap-2">
            {nav.map((item) => {
              const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href + '/'))
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'relative px-3 py-2 text-sm transition-colors focus-visible:rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-deep-teal',
                      active ? 'font-bold text-deep-teal after:absolute after:inset-x-3 after:-bottom-1 after:h-px after:bg-antique-gold' : 'font-medium text-text-soft hover:text-deep-teal',
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="hidden items-center gap-2 justify-self-end lg:flex">
          <ThemeToggle compact />
          <Link href="/search" aria-label="البحث في الموقع" aria-current={pathname === '/search' ? 'page' : undefined} className="flex h-10 w-10 items-center justify-center rounded-lg border border-line text-deep-teal transition-colors hover:border-antique-gold hover:bg-surface-raised focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep-teal">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden><circle cx="11" cy="11" r="6"/><path d="m16 16 4 4" strokeLinecap="round"/></svg>
          </Link>
          <Button href="/auth/login" size="sm" className="min-w-32 rounded-lg">تسجيل الدخول</Button>
        </div>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          disabled={!interactive}
          aria-expanded={open}
          aria-controls="public-mobile-navigation"
          aria-label={open ? 'إغلاق القائمة' : 'فتح القائمة'}
          className="flex h-11 w-11 items-center justify-center justify-self-end rounded-lg border border-line text-deep-teal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep-teal lg:hidden"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
            {open ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </div>

      {open && (
        <nav id="public-mobile-navigation" className="border-t border-line bg-ivory px-5 py-5 lg:hidden" aria-label="التنقل الرئيسي">
          <ul className="grid grid-cols-2 gap-2">
            {nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-lg border border-transparent px-4 py-3 text-sm font-semibold text-deep-teal hover:border-line hover:bg-surface-raised focus-visible:outline-2 focus-visible:outline-deep-teal"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex items-center gap-3 border-t border-line pt-4">
            <ThemeToggle compact className="shrink-0" />
            <Button href="/search" size="sm" variant="secondary" className="rounded-lg">البحث</Button>
            <Button href="/auth/login" size="sm" className="flex-1 rounded-lg">تسجيل الدخول</Button>
          </div>
        </nav>
      )}
    </header>
  )
}
