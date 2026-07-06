'use client'

import Link from 'next/link'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/cn'
import { Button } from '@/components/ui/Button'
import { BrandLogo } from './BrandLogo'

const allNav = [
  { href: '/', label: 'الرئيسية' },
  { href: '/courses', label: 'الدورات' },
  { href: '/books', label: 'الكتب' },
  { href: '/workshops', label: 'ورش العمل', flag: 'workshops' },
  { href: '/services', label: 'الخدمات' },
  { href: '/articles', label: 'المقالات' },
  { href: '/about', label: 'عن هبة' },
]

// Luxury RTL header — logo at inline-start (right), nav center, utilities at inline-end (left).
// Items tied to a feature flag disappear when the flag is off (§10).
export function PublicHeader({ flags = {} }: { flags?: Record<string, boolean> }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const nav = allNav.filter((item) => !item.flag || flags[item.flag] !== false)

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-ivory/90 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-6 px-6">
        <BrandLogo />

        <nav className="hidden lg:block" aria-label="التنقل الرئيسي">
          <ul className="flex items-center gap-1">
            {nav.map((item) => {
              const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href + '/'))
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'rounded-full px-4 py-2 text-sm font-medium transition-colors',
                      active ? 'bg-deep-teal/8 font-semibold text-deep-teal' : 'text-text-soft hover:text-deep-teal',
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Button href="/auth/login" variant="ghost" size="sm">
            تسجيل الدخول
          </Button>
          <Button href="/booking" variant="primary" size="sm">
            احجزي جلستك
          </Button>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? 'إغلاق القائمة' : 'فتح القائمة'}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-line text-deep-teal lg:hidden"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </div>

      {open && (
        <nav className="border-t border-line bg-ivory px-6 py-4 lg:hidden" aria-label="التنقل الرئيسي">
          <ul className="space-y-1">
            {nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-xl px-4 py-3 text-sm font-medium text-deep-teal hover:bg-deep-teal/5"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex gap-3 border-t border-line pt-4">
            <Button href="/auth/login" variant="secondary" size="sm" className="flex-1">
              تسجيل الدخول
            </Button>
            <Button href="/booking" variant="primary" size="sm" className="flex-1">
              احجزي جلستك
            </Button>
          </div>
        </nav>
      )}
    </header>
  )
}
