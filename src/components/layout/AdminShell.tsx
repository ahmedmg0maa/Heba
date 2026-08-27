import { Sidebar, type SidebarSection } from '@/components/ui/Sidebar'
import { BrandLogo } from './BrandLogo'
import { ThemeToggle } from '@/components/theme/ThemeToggle'
import { permissionsForRoles, type AdminRole, type Permission } from '@/lib/auth/permissions'

type Badges = Partial<Record<'payments' | 'orders' | 'bookings' | 'reviews' | 'messages', number>>

function sections(badges: Badges): SidebarSection[] {
  return [
    {
      items: [{ href: '/admin/overview', label: 'نظرة عامة' }],
    },
    {
      title: 'العمليات',
      items: [
        { href: '/admin/payments', label: 'موافقات الدفع', badge: badges.payments },
        { href: '/admin/orders', label: 'الطلبات', badge: badges.orders },
        { href: '/admin/bookings', label: 'الحجوزات', badge: badges.bookings },
        { href: '/admin/memberships', label: 'الباقات والاشتراكات' },
        { href: '/admin/users', label: 'العملاء' },
        { href: '/admin/inbox', label: 'الرسائل والقائمة البريدية', badge: badges.messages },
      ],
    },
    {
      title: 'المحتوى',
      items: [
        { href: '/admin/products', label: 'المنتجات' },
        { href: '/admin/courses', label: 'الدورات' },
        { href: '/admin/books', label: 'الكتب' },
        { href: '/admin/workshops', label: 'ورش العمل' },
        { href: '/admin/articles', label: 'المقالات' },
        { href: '/admin/pages', label: 'الصفحات' },
        { href: '/admin/revisions', label: 'مراجعات المحتوى' },
        { href: '/admin/media', label: 'الوسائط' },
        { href: '/admin/reviews', label: 'التقييمات', badge: badges.reviews },
        { href: '/admin/press', label: 'الظهور الإعلامي' },
      ],
    },
    {
      title: 'التسويق',
      items: [
        { href: '/admin/offers', label: 'العروض' },
        { href: '/admin/coupons', label: 'الكوبونات' },
        { href: '/admin/reports', label: 'التقارير' },
      ],
    },
    {
      title: 'النظام',
      items: [
        { href: '/admin/roles', label: 'الأدوار والصلاحيات' },
        { href: '/admin/audit-logs', label: 'سجل التدقيق' },
        { href: '/admin/security', label: 'الأمان' },
        { href: '/admin/settings', label: 'الإعدادات' },
        { href: '/admin/system', label: 'حالة النظام' },
      ],
    },
  ]
}

const routePermission: Record<string, Permission> = {
  '/admin/payments': 'payments.view', '/admin/orders': 'orders.view', '/admin/bookings': 'bookings.view',
  '/admin/memberships': 'packages.manage', '/admin/users': 'users.view', '/admin/inbox': 'inbox.view',
  '/admin/products': 'catalog.view', '/admin/courses': 'catalog.view', '/admin/books': 'catalog.view',
  '/admin/workshops': 'catalog.view', '/admin/articles': 'content.view', '/admin/pages': 'content.view',
  '/admin/revisions': 'content.manage',
  '/admin/media': 'media.view', '/admin/reviews': 'reviews.manage', '/admin/press': 'press.manage', '/admin/offers': 'marketing.manage',
  '/admin/coupons': 'marketing.manage', '/admin/reports': 'reports.view', '/admin/roles': 'roles.manage',
  '/admin/audit-logs': 'audit.view', '/admin/security': 'system.view', '/admin/settings': 'settings.view',
  '/admin/system': 'system.view',
}

export function AdminShell({ children, badges = {}, roles = [] }: { children: React.ReactNode; badges?: Badges; roles?: string[] }) {
  const permissions = permissionsForRoles(roles.length ? roles as AdminRole[] : ['owner'])
  const allowedSections = sections(badges)
    .map((section) => ({ ...section, items: section.items.filter((item) => {
      const required = routePermission[item.href]
      return !required || permissions.includes(required)
    }) }))
    .filter((section) => section.items.length > 0)
  return (
    <div className="dashboard-canvas flex min-h-screen flex-col bg-ivory lg:flex-row">
      <Sidebar
        brand={<BrandLogo tone="light" href="/admin/overview" />}
        sections={allowedSections}
        footer={
          <div className="space-y-3">
            <ThemeToggle className="w-full border-on-dark/20 text-on-dark hover:bg-on-dark/10" />
            <p className="text-xs text-on-dark/50">لوحة الإدارة</p>
          </div>
        }
      />
      <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 xl:px-10">{children}</main>
    </div>
  )
}
