'use client'

import Link from 'next/link'
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

// Deep-teal RTL sidebar rendered on the inline-start (right in RTL) edge.
export function Sidebar({ brand, sections, footer, className }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside
      className={cn(
        'sticky top-0 flex h-screen w-64 shrink-0 flex-col overflow-y-auto bg-deep-teal text-soft-white shadow-sidebar',
        className,
      )}
    >
      <div className="border-b border-soft-white/10 px-5 py-6">{brand}</div>

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

      {footer && <div className="border-t border-soft-white/10 px-5 py-4">{footer}</div>}
    </aside>
  )
}
