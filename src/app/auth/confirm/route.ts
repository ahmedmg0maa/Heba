import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import type { EmailOtpType } from '@supabase/supabase-js'

// Completes magic-link / email-confirmation sign-ins (Supabase redirects here with a token hash).
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const tokenHash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = searchParams.get('next') ?? '/dashboard'
  // only allow internal redirects
  const safeNext = next.startsWith('/') && !next.startsWith('//') ? next : '/dashboard'

  const redirectTo = request.nextUrl.clone()
  redirectTo.search = ''

  if (tokenHash && type) {
    const response = NextResponse.redirect(new URL(safeNext, request.url))
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
          },
        },
      },
    )
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash })
    if (!error) return response
  }

  redirectTo.pathname = '/auth/login'
  redirectTo.searchParams.set('error', 'link')
  return NextResponse.redirect(redirectTo)
}
