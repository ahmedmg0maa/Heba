import { Sidebar, type SidebarSection } from '@/components/ui/Sidebar'
import { BrandLogo } from './BrandLogo'

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
        { href: '/admin/users', label: 'العملاء' },
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
        { href: '/admin/media', label: 'الوسائط' },
        { href: '/admin/reviews', label: 'التقييمات', badge: badges.reviews },
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

export function AdminShell({ children, badges = {} }: { children: React.ReactNode; badges?: Badges }) {
  return (
    <div className="flex min-h-screen bg-ivory">
      <Sidebar
        brand={<BrandLogo tone="light" href="/admin/overview" />}
        sections={sections(badges)}
        footer={<p className="text-xs text-soft-white/50">لوحة الإدارة</p>}
      />
      <main className="min-w-0 flex-1 px-6 py-8 lg:px-10">{children}</main>
    </div>
  )
}
