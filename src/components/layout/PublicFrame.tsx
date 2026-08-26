'use client'

import { usePathname } from 'next/navigation'
import { PublicHeader } from './PublicHeader'
import { PublicFooter } from './PublicFooter'
import type { PublicNavigationItem } from '@/lib/data/cms'

export function PublicFrame({ children, flags, navigation }: { children: React.ReactNode; flags: Record<string, boolean>; navigation:PublicNavigationItem[] }) {
  const pathname = usePathname()
  if (pathname.startsWith('/auth/')) return <>{children}</>
  return (
    <>
      <a
        href="#main-content"
        className="sr-only fixed start-4 top-4 z-[70] rounded-lg bg-deep-teal px-4 py-3 text-sm font-semibold text-on-dark shadow-card focus:not-sr-only focus:outline-2 focus:outline-offset-2 focus:outline-antique-gold"
      >
        تخطّي إلى المحتوى
      </a>
      <PublicHeader flags={flags} items={navigation.filter(item=>item.menu==='header')} />
      <div id="main-content" tabIndex={-1} className="flex flex-1 flex-col outline-none">{children}</div>
      <PublicFooter items={navigation.filter(item=>item.menu.startsWith('footer_'))} />
    </>
  )
}
