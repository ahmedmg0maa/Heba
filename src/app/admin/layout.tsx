import { requireAdmin } from '@/lib/auth/admin'
import { getPendingPaymentsCount } from '@/lib/data/admin'
import { AdminShell } from '@/components/layout/AdminShell'
import { AdminTopbar } from '@/components/admin/AdminTopbar'

// Role check: requireAdmin() redirects non-admins (admin_roles lookup).
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin()
  const pendingPayments = await getPendingPaymentsCount()
  return (
    <AdminShell badges={{ payments: pendingPayments }}>
      <div className="mx-auto max-w-6xl">
        <AdminTopbar />
      </div>
      {children}
    </AdminShell>
  )
}
