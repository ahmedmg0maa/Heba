import { requireAdmin } from '@/lib/auth/admin'
import { getPendingPaymentsCount } from '@/lib/data/admin'
import { AdminShell } from '@/components/layout/AdminShell'

// Role check: requireAdmin() redirects non-admins (admin_roles lookup).
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin()
  const pendingPayments = await getPendingPaymentsCount()
  return <AdminShell badges={{ payments: pendingPayments }}>{children}</AdminShell>
}
