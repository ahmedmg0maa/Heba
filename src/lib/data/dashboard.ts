import { getServerClient } from '@/lib/supabase/server'

export type MyPayment = {
  id: string
  orderId: string
  method: string
  amount: number
  status: 'pending' | 'approved' | 'rejected'
  rejectReason: string | null
  createdAt: string
  reviewedAt: string | null
  orderStatus: string
  orderExpiresAt: string | null
  productTitles: string[]
}

export type MyProfile = { id: string; fullName: string; email: string; phone: string | null }

export type MyCourse = {
  slug: string
  title: string
  percent: number
  lessonsCount: number
  durationMinutes: number
}

export type MyBook = { slug: string; title: string; pagesCount: number | null; grantedAt: string }

export type MyWorkshop = {
  slug: string
  title: string
  startsAt: string
  endsAt: string
  status: string
  locationKind: string
  meetingUrl: string | null
}

export type MyBooking = {
  id: string
  serviceTitle: string
  startsAt: string
  endsAt: string
  status: string
  meetingUrl: string | null
}

export type MyOrder = {
  id: string
  status: string
  total: number
  createdAt: string
  expiresAt: string | null
  productTitles: string[]
}

export type MyNotification = {
  id: string
  title: string
  body: string
  kind: string
  link: string | null
  readAt: string | null
  createdAt: string
}

const hasEnv = () =>
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

async function withUser<T>(fallback: T, fn: (supabase: Awaited<ReturnType<typeof getServerClient>>, userId: string) => Promise<T>): Promise<T> {
  if (!hasEnv()) return fallback
  try {
    const supabase = await getServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return fallback
    return await fn(supabase, user.id)
  } catch {
    return fallback
  }
}

export async function getMyProfile(): Promise<MyProfile | null> {
  return withUser<MyProfile | null>(null, async (supabase, userId) => {
    const { data } = await supabase.from('profiles').select('id, full_name, email, phone').eq('id', userId).maybeSingle()
    return data ? { id: data.id, fullName: data.full_name, email: data.email, phone: data.phone } : null
  })
}

export async function getMyCourses(): Promise<MyCourse[]> {
  return withUser<MyCourse[]>([], async (supabase, userId) => {
    const { data } = await supabase
      .from('course_enrollments')
      .select('courses!inner(slug, title, duration_minutes, course_modules(course_lessons(id))), course_id')
      .eq('user_id', userId)
    if (!data) return []
    const { data: progress } = await supabase
      .from('course_progress')
      .select('course_id, percent')
      .eq('user_id', userId)
    const pct = new Map((progress ?? []).map((p) => [p.course_id, Number(p.percent)]))
    return data.map((e) => {
      const c = Array.isArray(e.courses) ? e.courses[0] : e.courses
      const modules = (c?.course_modules ?? []) as { course_lessons: { id: string }[] }[]
      return {
        slug: c?.slug ?? '',
        title: c?.title ?? '',
        percent: pct.get(e.course_id) ?? 0,
        lessonsCount: modules.reduce((n, m) => n + (m.course_lessons?.length ?? 0), 0),
        durationMinutes: c?.duration_minutes ?? 0,
      }
    })
  })
}

export async function getMyBooks(): Promise<MyBook[]> {
  return withUser<MyBook[]>([], async (supabase, userId) => {
    const { data } = await supabase
      .from('book_access')
      .select('granted_at, books!inner(slug, title, pages_count)')
      .eq('user_id', userId)
    return (data ?? []).map((a) => {
      const b = Array.isArray(a.books) ? a.books[0] : a.books
      return { slug: b?.slug ?? '', title: b?.title ?? '', pagesCount: b?.pages_count ?? null, grantedAt: a.granted_at }
    })
  })
}

export async function getMyWorkshops(): Promise<MyWorkshop[]> {
  return withUser<MyWorkshop[]>([], async (supabase, userId) => {
    const { data } = await supabase
      .from('workshop_registrations')
      .select('status, workshops!inner(slug, title, starts_at, ends_at, location_kind, meeting_url)')
      .eq('user_id', userId)
      .neq('status', 'cancelled')
    return (data ?? []).map((r) => {
      const w = Array.isArray(r.workshops) ? r.workshops[0] : r.workshops
      return {
        slug: w?.slug ?? '',
        title: w?.title ?? '',
        startsAt: w?.starts_at ?? '',
        endsAt: w?.ends_at ?? '',
        status: r.status,
        locationKind: w?.location_kind ?? 'online',
        meetingUrl: w?.meeting_url ?? null,
      }
    })
  })
}

export async function getMyBookings(): Promise<MyBooking[]> {
  return withUser<MyBooking[]>([], async (supabase, userId) => {
    const { data } = await supabase
      .from('bookings')
      .select('id, starts_at, ends_at, status, meeting_url, services!inner(title)')
      .eq('user_id', userId)
      .order('starts_at', { ascending: false })
    return (data ?? []).map((b) => {
      const s = Array.isArray(b.services) ? b.services[0] : b.services
      return {
        id: b.id,
        serviceTitle: s?.title ?? '',
        startsAt: b.starts_at,
        endsAt: b.ends_at,
        status: b.status,
        meetingUrl: b.meeting_url,
      }
    })
  })
}

export async function getMyOrders(): Promise<MyOrder[]> {
  return withUser<MyOrder[]>([], async (supabase, userId) => {
    const { data } = await supabase
      .from('orders')
      .select('id, status, total, created_at, expires_at, order_items(products(title))')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    return (data ?? []).map((o) => {
      const items = (o.order_items ?? []) as { products: { title: string } | { title: string }[] | null }[]
      return {
        id: o.id,
        status: o.status,
        total: Number(o.total),
        createdAt: o.created_at,
        expiresAt: o.expires_at,
        productTitles: items
          .map((i) => (Array.isArray(i.products) ? i.products[0]?.title : i.products?.title))
          .filter((t): t is string => Boolean(t)),
      }
    })
  })
}

export async function getMyNotifications(): Promise<MyNotification[]> {
  return withUser<MyNotification[]>([], async (supabase, userId) => {
    const { data } = await supabase
      .from('notifications')
      .select('id, title, body, kind, link, read_at, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50)
    return (data ?? []).map((n) => ({
      id: n.id,
      title: n.title,
      body: n.body,
      kind: n.kind,
      link: n.link,
      readAt: n.read_at,
      createdAt: n.created_at,
    }))
  })
}

export async function getMyPayments(): Promise<MyPayment[]> {
  if (!hasEnv()) return []
  try {
    const supabase = await getServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return []

    const { data } = await supabase
      .from('payments')
      .select(
        'id, order_id, method, amount, status, reject_reason, created_at, reviewed_at, orders!inner(status, expires_at, order_items(products(title)))',
      )
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    return (data ?? []).map((p) => {
      const order = Array.isArray(p.orders) ? p.orders[0] : p.orders
      const items = (order?.order_items ?? []) as { products: { title: string } | { title: string }[] | null }[]
      return {
        id: p.id,
        orderId: p.order_id,
        method: p.method,
        amount: Number(p.amount),
        status: p.status as MyPayment['status'],
        rejectReason: p.reject_reason,
        createdAt: p.created_at,
        reviewedAt: p.reviewed_at,
        orderStatus: order?.status ?? 'pending_payment',
        orderExpiresAt: order?.expires_at ?? null,
        productTitles: items
          .map((i) => (Array.isArray(i.products) ? i.products[0]?.title : i.products?.title))
          .filter((t): t is string => Boolean(t)),
      }
    })
  } catch {
    return []
  }
}
