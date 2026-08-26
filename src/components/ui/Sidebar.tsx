'use client'

import Link from 'next/link'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/cn'
import { BotanicalSpray } from '@/components/layout/BotanicalSpray'

export type SidebarItem = {
  href: string
  label: string
  icon?: React.ReactNode
  badge?: number
}

export type SidebarSection = {
  title?: string
  items: SidebarItem[]
}

type SidebarProps = {
  brand: React.ReactNode
  sections: SidebarSection[]
  footer?: React.ReactNode
  className?: string
}

function SidebarGlyph({ href }: { href: string }) {
  let path: React.ReactNode
  if (href.endsWith('/overview') || href === '/dashboard')
    path = <><path d="M4 11 12 4l8 7v9H4z" /><path d="M9 20v-6h6v6" /></>
  else if (href.includes('payment')) path = <><rect x="3" y="6" width="18" height="13" rx="2" /><path d="M3 10h18M7 15h4" /></>
  else if (href.includes('order')) path = <><path d="M7 4h10l2 3v14H5V7z" /><path d="M8 11h8M8 15h6" /></>
  else if (href.includes('booking')) path = <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M7 3v4M17 3v4M3 10h18M8 14h3v3H8z" /></>
  else if (href.includes('user') || href.includes('profile') || href.includes('role')) path = <><circle cx="12" cy="8" r="4" /><path d="M5 21c0-4 3-7 7-7s7 3 7 7" /></>
  else if (href.includes('course')) path = <><rect x="3" y="5" width="18" height="13" rx="2" /><path d="M9 22h6M12 18v4M8 10l3 2 5-4" /></>
  else if (href.includes('book')) path = <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z" /><path d="M4 5.5v15M20 18v3H6.5" /></>
  else if (href.includes('workshop')) path = <><path d="M4 20h16M6 20V9l6-5 6 5v11" /><path d="M9 13h6M12 10v6" /></>
  else if (href.includes('article') || href.includes('page')) path = <><path d="M6 3h9l4 4v14H6z" /><path d="M15 3v5h4M9 12h7M9 16h7" /></>
  else if (href.includes('media')) path = <><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="9" cy="10" r="2" /><path d="m5 18 5-5 3 3 2-2 4 4" /></>
  else if (href.includes('review')) path = <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9z" />
  else if (href.includes('offer') || href.includes('coupon')) path = <><path d="M4 7a3 3 0 0 0 0 6v5h16v-5a3 3 0 0 0 0-6V4H4z" /><path d="M12 7v10" /></>
  else if (href.includes('report')) path = <><path d="M5 20V10M12 20V4M19 20v-7" /><path d="M3 20h18" /></>
  else if (href.includes('audit') || href.includes('security')) path = <><path d="M12 3 20 6v6c0 5-3.4 8-8 10-4.6-2-8-5-8-10V6z" /><path d="m9 12 2 2 4-5" /></>
  else if (href.includes('setting') || href.includes('system')) path = <><circle cx="12" cy="12" r="3" /><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1" /></>
  else if (href.includes('notification')) path = <><path d="M6 17h12l-1.5-2V10a4.5 4.5 0 0 0-9 0v5z" /><path d="M10 20h4" /></>
  else path = <><circle cx="12" cy="12" r="8" /><path d="M8 12h8" /></>

  return <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>{path}</svg>
}

function Nav({ sections, onNavigate }: { sections: SidebarSection[]; onNavigate?: () => void }) {
  const pathname = usePathname()
  return (
    <nav className="flex-1 space-y-6 px-3 py-6">
      {sections.map((section, i) => (
        <div key={section.title ?? i}>
          {section.title && (
            <p className="mb-2 px-3 text-xs font-semibold tracking-widest text-muted-gold/80">{section.title}</p>
          )}
          <ul className="space-y-1">
            {section.items.map((item) => {
              const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href + '/'))
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors',
                      active
                        ? 'bg-on-dark/10 font-semibold text-on-dark shadow-card before:absolute before:inset-y-2 before:-end-3 before:w-0.5 before:bg-antique-gold'
                        : 'text-on-dark/70 hover:bg-on-dark/5 hover:text-on-dark',
                    )}
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-on-dark/10 text-muted-gold opacity-90">
                      {item.icon ?? <SidebarGlyph href={item.href} />}
                    </span>
                    <span className="flex-1">{item.label}</span>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="tnum rounded-full bg-burgundy px-2 py-0.5 text-xs font-bold text-on-dark">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </nav>
  )
}

// Deep-teal RTL sidebar: fixed column on desktop (inline-start = right in RTL),
// top bar + slide-over drawer on mobile.
export function Sidebar({ brand, sections, footer, className }: SidebarProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Mobile top bar */}
      <div className="sticky top-0 z-40 flex w-full items-center justify-between bg-deep-teal px-4 py-3 text-on-dark shadow-sidebar lg:hidden">
        {brand}
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="فتح القائمة"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-on-dark/20"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="قائمة التنقل">
          <button
            type="button"
            aria-label="إغلاق القائمة"
            onClick={() => setOpen(false)}
            className="animate-backdrop absolute inset-0 bg-ink/50 backdrop-blur-sm"
          />
          <div className="animate-drawer pb-safe absolute inset-y-0 end-0 flex w-72 max-w-[85vw] flex-col overflow-y-auto bg-deep-teal text-on-dark shadow-sidebar">
            <div className="flex items-center justify-between border-b border-on-dark/10 px-5 py-5">
              {brand}
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="إغلاق"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-on-dark/20"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>
            <Nav sections={sections} onNavigate={() => setOpen(false)} />
            <BotanicalSpray mirrored className="pointer-events-none absolute -bottom-20 -start-14 h-72 text-muted-gold opacity-20" />
            {footer && <div className="border-t border-on-dark/10 px-5 py-4">{footer}</div>}
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside
        className={cn(
          'relative sticky top-0 hidden h-screen w-72 shrink-0 flex-col overflow-y-auto bg-deep-teal text-on-dark shadow-sidebar lg:flex',
          className,
        )}
      >
        <div className="border-b border-on-dark/10 px-5 py-6">{brand}</div>
        <Nav sections={sections} />
        <BotanicalSpray mirrored className="pointer-events-none absolute -bottom-16 -start-20 h-72 text-muted-gold opacity-18" />
        {footer && <div className="border-t border-on-dark/10 px-5 py-4">{footer}</div>}
      </aside>
    </>
  )
}
