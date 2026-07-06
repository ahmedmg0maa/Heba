import { getServerClient } from '@/lib/supabase/server'

const hasEnv = () =>
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

export type FeatureFlags = Record<string, boolean>

const defaultFlags: FeatureFlags = { workshops: true, vip_program: false, certificates: true }

export async function getFeatureFlags(): Promise<FeatureFlags> {
  if (!hasEnv()) return defaultFlags
  try {
    const supabase = await getServerClient()
    const { data } = await supabase.from('feature_flags').select('key, is_enabled')
    if (!data || data.length === 0) return defaultFlags
    return { ...defaultFlags, ...Object.fromEntries(data.map((f) => [f.key, f.is_enabled])) }
  } catch {
    return defaultFlags
  }
}

// Generic guarded list fetch for admin tables (read-side only; RLS still applies).
export async function adminList<T>(
  table: string,
  columns: string,
  opts: { orderBy?: string; ascending?: boolean; limit?: number } = {},
): Promise<T[]> {
  if (!hasEnv()) return []
  try {
    const supabase = await getServerClient()
    let query = supabase.from(table).select(columns).limit(opts.limit ?? 100)
    if (opts.orderBy) query = query.order(opts.orderBy, { ascending: opts.ascending ?? false })
    const { data } = await query
    return (data ?? []) as T[]
  } catch {
    return []
  }
}
