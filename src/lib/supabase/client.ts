import { createBrowserClient } from '@supabase/ssr'

// Create lazily (inside handlers/effects) — never at module scope, so
// prerendering client components without env vars can't crash the build.
export function getBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}
