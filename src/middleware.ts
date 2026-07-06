import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Demo mode (no Supabase env): no sessions exist — let pages render their
  // own demo/empty states instead of crashing on client creation.
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.next({ request })
  }

  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname
  const needsAuth = path.startsWith('/dashboard') || path.startsWith('/admin')

  if (needsAuth && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    url.searchParams.set('redirect', path)
    return NextResponse.redirect(url)
  }

  if (path.startsWith('/admin') && user) {
    const { data: role } = await supabase
      .from('admin_roles')
      .select('role')
      .eq('user_id', user.id)
      .limit(1)
      .maybeSingle()
    if (!role) {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      url.search = ''
      return NextResponse.redirect(url)
    }
  }

  return response
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/checkout/:path*'],
}
