'use client'

import Link from 'next/link'
import { useState, useSyncExternalStore } from 'react'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/cn'
import { BrandLogo } from './BrandLogo'
import { ThemeToggle } from '@/components/theme/ThemeToggle'
import type { PublicNavigationItem } from '@/lib/data/cms'

const allNav = [
  { href: '/', label: 'الرئيسية' },
  { href: '/start-here', label: 'ابدئي من هنا' },
  { href: '/courses', label: 'الدورات' },
  { href: '/books', label: 'الكتب' },
  { href: '/workshops', label: 'الورش', flag: 'workshops' },
  { href: '/services', label: 'الخدمات' },
  { href: '/programs', label: 'البرامج' },
  { href: '/articles', label: 'المقالات' },
]

function SearchIcon() {
  return <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden><circle cx="11" cy="11" r="6"/><path d="m16 16 4 4" strokeLinecap="round"/></svg>
}

function UserIcon() {
  return <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden><circle cx="12" cy="8" r="3.2"/><path d="M5.5 20c.7-4.1 2.8-6.2 6.5-6.2s5.8 2.1 6.5 6.2" strokeLinecap="round"/></svg>
}

export function PublicHeader({ flags = {}, items = [] }: { flags?: Record<string, boolean>; items?: PublicNavigationItem[] }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const interactive = useSyncExternalStore(() => () => {}, () => true, () => false)
  const nav = (items.length ? items : allNav).filter((item) => !('flag' in item) || !item.flag || flags[item.flag] !== false)

  return (
    <header className="sticky top-0 z-50 border-b border-on-dark/10 bg-deep-teal/96 text-on-dark shadow-[0_16px_40px_rgb(7_28_35_/_0.2)] backdrop-blur-xl">
      <div className="hidden border-b border-antique-gold/16 bg-[#102F39] text-on-dark lg:block">
        <div className="mx-auto flex h-9 max-w-[1440px] items-center justify-between px-8 text-[11px] font-medium tracking-wide">
          <p className="flex items-center gap-2 text-on-dark/76">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-aqua" aria-hidden />
            مساحة عربية هادئة للفهم والتعلّم والاختيار الواعي
          </p>
          <div className="flex items-center gap-5">
            <Link href="/about" className="text-on-dark/65 transition-colors hover:text-aqua">عن هبة</Link>
            <Link href="/faq" className="text-on-dark/65 transition-colors hover:text-aqua">الأسئلة الشائعة</Link>
            <Link href="/contact" className="text-on-dark/65 transition-colors hover:text-aqua">تواصلي معنا</Link>
          </div>
        </div>
      </div>

      <div className="mx-auto grid min-h-[76px] max-w-[1440px] grid-cols-[1fr_auto] items-center gap-3 px-4 sm:px-6 lg:min-h-[86px] lg:grid-cols-[auto_1fr_auto] lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <BrandLogo className="h-12 w-12 rounded-[1.1rem] lg:h-14 lg:w-14" />
          <Link href="/" className="min-w-0 leading-none focus-visible:rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-deep-teal" aria-label="هبة الشريف — الصفحة الرئيسية">
            <span className="block truncate font-heading text-[1.35rem] font-bold text-on-dark lg:text-2xl">هبة الشريف</span>
            <span className="mt-1.5 block truncate text-[8px] font-bold tracking-[0.26em] text-aqua sm:text-[9px]" dir="ltr">HEBA ELSHERIF</span>
          </Link>
        </div>

        <nav className="hidden justify-self-center lg:block" aria-label="التنقل الرئيسي">
          <ul className="flex items-center gap-0.5 xl:gap-1">
            {nav.map((item) => {
              const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href + '/'))
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'relative rounded-full px-3 py-2.5 text-[13px] transition duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep-teal xl:px-3.5 xl:text-sm',
                      active
                        ? 'bg-on-dark/8 font-bold text-on-dark after:absolute after:inset-x-5 after:bottom-1 after:h-px after:bg-aqua'
                        : 'font-semibold text-on-dark/62 hover:bg-on-dark/7 hover:text-on-dark',
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="flex items-center justify-self-end">
          <div className="hidden items-center gap-1.5 lg:flex">
            <ThemeToggle compact />
            <Link href="/search" aria-label="البحث في الموقع" aria-current={pathname === '/search' ? 'page' : undefined} className="flex h-10 w-10 items-center justify-center rounded-full border border-on-dark/16 bg-on-dark/6 text-on-dark transition hover:-translate-y-0.5 hover:border-aqua hover:text-aqua focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-aqua">
              <SearchIcon />
            </Link>
            <Link href="/auth/login" aria-label="دخول الحساب" className="flex h-10 w-10 items-center justify-center rounded-full border border-on-dark/16 bg-on-dark/6 text-on-dark transition hover:-translate-y-0.5 hover:border-aqua hover:text-aqua focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-aqua">
              <UserIcon />
            </Link>
            <Link href="/booking" className="ms-1 inline-flex min-h-11 items-center justify-center rounded-full bg-aqua px-5 text-sm font-bold text-deep-teal shadow-card transition hover:-translate-y-0.5 hover:bg-on-dark hover:shadow-card-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-aqua">
              احجزي جلستك
            </Link>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 lg:hidden">
            <Link href="/search" aria-label="البحث في الموقع" className="flex h-11 w-11 items-center justify-center rounded-full text-on-dark focus-visible:outline-2 focus-visible:outline-aqua"><SearchIcon /></Link>
            <Link href="/auth/login" aria-label="دخول الحساب" className="hidden h-11 w-11 items-center justify-center rounded-full text-on-dark focus-visible:outline-2 focus-visible:outline-aqua sm:flex"><UserIcon /></Link>
            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              disabled={!interactive}
              aria-expanded={open}
              aria-controls="public-mobile-navigation"
              aria-label={open ? 'إغلاق القائمة' : 'فتح القائمة'}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-on-dark/18 bg-on-dark/6 text-on-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-aqua"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
                {open ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {open && (
        <nav id="public-mobile-navigation" className="animate-drawer border-t border-on-dark/12 bg-deep-teal px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4 shadow-card lg:hidden" aria-label="التنقل الرئيسي">
          <div className="mb-4 flex items-center justify-between rounded-2xl border border-on-dark/12 bg-on-dark/6 px-4 py-3 text-on-dark">
            <p className="text-sm font-bold">أين تحبين أن تبدئي؟</p>
            <ThemeToggle compact className="border-on-dark/20 text-on-dark" />
          </div>
          <ul className="grid grid-cols-2 gap-2">
            {nav.map((item) => {
              const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href + '/'))
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    aria-current={active ? 'page' : undefined}
                    className={cn('flex min-h-12 items-center rounded-xl border px-4 py-3 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-aqua', active ? 'border-aqua bg-aqua/12 text-aqua' : 'border-on-dark/12 bg-on-dark/5 text-on-dark/72')}
                  >
                    {item.label}
                  </Link>
                </li>
              )
            })}
          </ul>
          <div className="mt-4 grid grid-cols-2 gap-2 border-t border-on-dark/12 pt-4">
            <Link href="/auth/login" onClick={() => setOpen(false)} className="inline-flex min-h-12 items-center justify-center rounded-full border border-on-dark/24 font-bold text-on-dark">دخول الحساب</Link>
            <Link href="/booking" onClick={() => setOpen(false)} className="inline-flex min-h-12 items-center justify-center rounded-full bg-aqua font-bold text-deep-teal">احجزي جلسة</Link>
          </div>
        </nav>
      )}
    </header>
  )
}
