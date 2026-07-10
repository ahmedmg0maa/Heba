import { Sidebar, type SidebarSection } from '@/components/ui/Sidebar'
import { BrandLogo } from './BrandLogo'

const sections: SidebarSection[] = [
  {
    items: [
      { href: '/dashboard', label: 'الرئيسية' },
      { href: '/dashboard/courses', label: 'دوراتي' },
      { href: '/dashboard/books', label: 'كتبي' },
      { href: '/dashboard/workshops', label: 'ورشي' },
      { href: '/dashboard/bookings', label: 'حجوزاتي' },
    ],
  },
  {
    title: 'الحساب',
    items: [
      { href: '/dashboard/orders', label: 'طلباتي' },
      { href: '/dashboard/payments', label: 'مدفوعاتي' },
      { href: '/dashboard/notifications', label: 'الإشعارات' },
      { href: '/dashboard/profile', label: 'ملفي الشخصي' },
      { href: '/dashboard/settings', label: 'الإعدادات' },
    ],
  },
]

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-ivory lg:flex-row">
      <Sidebar
        brand={<BrandLogo tone="light" href="/dashboard" />}
        sections={sections}
        footer={<p className="text-xs text-soft-white/50">مساحة المتعلّمة</p>}
      />
      <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-10">{children}</main>
    </div>
  )
}
