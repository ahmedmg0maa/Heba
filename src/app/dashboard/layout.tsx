import { DashboardShell } from '@/components/layout/DashboardShell'

// Auth is enforced by middleware (redirects anonymous users to /auth/login).
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>
}
