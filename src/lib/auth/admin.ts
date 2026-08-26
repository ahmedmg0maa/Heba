import { redirect } from 'next/navigation'
import { requirePermission } from '@/lib/auth/permissions'
import type { AdminSession } from '@/lib/auth/admin-session'

export type AdminContext = { userId: string | null; role: string | null; roles: string[]; session: AdminSession | null }

// Server-side admin gate for the /admin tree (middleware guards too — defense in depth).
export async function requireAdmin(): Promise<AdminContext> {
  const context = await requirePermission('admin.access', { redirectOnFailure: true })
  if (!context) redirect('/auth/admin?error=role')
  return { userId: context.userId, role: context.role, roles: context.roles, session: context.session }
}
