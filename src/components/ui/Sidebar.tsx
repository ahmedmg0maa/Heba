'use client'

import Link from 'next/link'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/cn'

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
                      'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors',
                      active
                        ? 'bg-soft-white/10 font-semibold text-soft-white shadow-card'
                        : 'text-soft-white/70 hover:bg-soft-white/5 hover:text-soft-white',
                    )}
                  >
                    {item.icon && <span className="opacity-90">{item.icon}</span>}
                    <span className="flex-1">{item.label}</span>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="tnum rounded-full bg-burgundy px-2 py-0.5 text-xs font-bold text-soft-white">
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
      <div className="sticky top-0 z-40 flex w-full items-center justify-between bg-deep-teal px-4 py-3 text-soft-white shadow-sidebar lg:hidden">
        {brand}
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="فتح القائمة"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-soft-white/20"
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
            className="absolute inset-0 bg-ink/50 backdrop-blur-sm"
          />
          <div className="absolute inset-y-0 end-0 flex w-72 max-w-[85vw] flex-col overflow-y-auto bg-deep-teal text-soft-white shadow-sidebar">
            <div className="flex items-center justify-between border-b border-soft-white/10 px-5 py-5">
              {brand}
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="إغلاق"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-soft-white/20"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>
            <Nav sections={sections} onNavigate={() => setOpen(false)} />
            {footer && <div className="border-t border-soft-white/10 px-5 py-4">{footer}</div>}
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside
        className={cn(
          'sticky top-0 hidden h-screen w-64 shrink-0 flex-col overflow-y-auto bg-deep-teal text-soft-white shadow-sidebar lg:flex',
          className,
        )}
      >
        <div className="border-b border-soft-white/10 px-5 py-6">{brand}</div>
        <Nav sections={sections} />
        {footer && <div className="border-t border-soft-white/10 px-5 py-4">{footer}</div>}
      </aside>
    </>
  )
}
