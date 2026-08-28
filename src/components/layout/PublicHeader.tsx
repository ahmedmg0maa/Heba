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
    <header className="sticky top-0 z-50 border-b border-line/80 bg-surface-raised/92 text-ink shadow-[0_12px_34px_rgb(38_56_61_/_0.08)] backdrop-blur-xl dark:border-on-dark/10 dark:bg-[#0B2B35]/94 dark:text-on-dark dark:shadow-[0_16px_40px_rgb(0_0_0_/_0.22)]">
      <div className="mx-auto grid min-h-[76px] max-w-[1540px] grid-cols-[1fr_auto] items-center gap-3 px-4 sm:px-6 lg:min-h-[82px] lg:grid-cols-[auto_1fr_auto] lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <BrandLogo className="h-11 w-11 rounded-[1rem] shadow-card lg:h-13 lg:w-13" />
          <Link href="/" className="min-w-0 leading-none focus-visible:rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-deep-teal" aria-label="هبة الشريف — الصفحة الرئيسية">
            <span className="block truncate font-heading text-[1.35rem] font-bold text-deep-teal dark:text-on-dark lg:text-[1.65rem]">هبة الشريف</span>
            <span className="mt-1.5 block truncate text-[8px] font-bold tracking-[0.26em] text-aqua-deep dark:text-aqua sm:text-[9px]" dir="ltr">HEBA ELSHERIF</span>
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
                      'relative rounded-full px-2.5 py-2.5 text-[12px] transition duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep-teal xl:px-3.5 xl:text-sm',
                      active
                        ? 'bg-aqua/12 font-bold text-deep-teal after:absolute after:inset-x-5 after:bottom-1 after:h-px after:bg-aqua-deep dark:bg-on-dark/8 dark:text-on-dark dark:after:bg-aqua'
                        : 'font-semibold text-text-soft hover:bg-aqua/8 hover:text-deep-teal dark:text-on-dark/68 dark:hover:bg-on-dark/7 dark:hover:text-on-dark',
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
            <Link href="/search" aria-label="البحث في الموقع" title="البحث" aria-current={pathname === '/search' ? 'page' : undefined} className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface-raised text-deep-teal transition hover:-translate-y-0.5 hover:border-aqua hover:bg-aqua/8 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-aqua dark:border-on-dark/16 dark:bg-on-dark/6 dark:text-on-dark dark:hover:text-aqua">
              <SearchIcon />
            </Link>
            <Link href="/auth/login" aria-label="دخول الحساب" title="حسابي" className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface-raised text-deep-teal transition hover:-translate-y-0.5 hover:border-aqua hover:bg-aqua/8 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-aqua dark:border-on-dark/16 dark:bg-on-dark/6 dark:text-on-dark dark:hover:text-aqua">
              <UserIcon />
            </Link>
            <Link href="/booking" className="ms-1 inline-flex min-h-11 items-center justify-center rounded-full bg-deep-teal px-5 text-sm font-bold text-on-dark shadow-card transition hover:-translate-y-0.5 hover:bg-teal-hover hover:shadow-card-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-aqua dark:bg-aqua dark:text-deep-teal dark:hover:bg-on-dark">
              احجزي جلستك
            </Link>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 lg:hidden">
            <Link href="/search" aria-label="البحث في الموقع" className="flex h-11 w-11 items-center justify-center rounded-full text-deep-teal dark:text-on-dark focus-visible:outline-2 focus-visible:outline-aqua"><SearchIcon /></Link>
            <Link href="/auth/login" aria-label="دخول الحساب" className="hidden h-11 w-11 items-center justify-center rounded-full text-deep-teal dark:text-on-dark focus-visible:outline-2 focus-visible:outline-aqua sm:flex"><UserIcon /></Link>
            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              disabled={!interactive}
              aria-expanded={open}
              aria-controls="public-mobile-navigation"
              aria-label={open ? 'إغلاق القائمة' : 'فتح القائمة'}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-line bg-surface-raised text-deep-teal dark:border-on-dark/18 dark:bg-on-dark/6 dark:text-on-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-aqua"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
                {open ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {open && (
        <nav id="public-mobile-navigation" className="animate-drawer border-t border-line bg-surface-raised px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4 shadow-card dark:border-on-dark/12 dark:bg-deep-teal lg:hidden" aria-label="التنقل الرئيسي">
          <div className="mb-4 flex items-center justify-between rounded-2xl border border-line bg-ivory/70 px-4 py-3 text-deep-teal dark:border-on-dark/12 dark:bg-on-dark/6 dark:text-on-dark">
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
                    className={cn('flex min-h-12 items-center rounded-xl border px-4 py-3 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-aqua', active ? 'border-aqua bg-aqua/12 text-deep-teal dark:text-aqua' : 'border-line bg-ivory/55 text-text-soft dark:border-on-dark/12 dark:bg-on-dark/5 dark:text-on-dark/72')}
                  >
                    {item.label}
                  </Link>
                </li>
              )
            })}
          </ul>
          <div className="mt-4 grid grid-cols-2 gap-2 border-t border-line pt-4 dark:border-on-dark/12">
            <Link href="/auth/login" onClick={() => setOpen(false)} className="inline-flex min-h-12 items-center justify-center rounded-full border border-line font-bold text-deep-teal dark:border-on-dark/24 dark:text-on-dark">دخول الحساب</Link>
            <Link href="/booking" onClick={() => setOpen(false)} className="inline-flex min-h-12 items-center justify-center rounded-full bg-deep-teal font-bold text-on-dark dark:bg-aqua dark:text-deep-teal">احجزي جلسة</Link>
          </div>
        </nav>
      )}
    </header>
  )
}
