import { redirect } from 'next/navigation'
import { getServerClient } from '@/lib/supabase/server'

const hasEnv = () =>
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

export type AdminContext = { userId: string | null; role: string | null; demo: boolean }

// Server-side admin gate for the /admin tree (middleware guards too — defense in depth).
// Demo mode (no env) renders admin UI with zero data so the OS is reviewable pre-integration.
export async function requireAdmin(): Promise<AdminContext> {
  if (!hasEnv()) return { userId: null, role: null, demo: true }
  const supabase = await getServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login?redirect=/admin/overview')
  const { data: roleRow } = await supabase
    .from('admin_roles')
    .select('role')
    .eq('user_id', user.id)
    .limit(1)
    .maybeSingle()
  if (!roleRow) redirect('/dashboard')
  return { userId: user.id, role: roleRow.role, demo: false }
}
