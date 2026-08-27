import { getServerClient } from '@/lib/supabase/server'
import { hasSupabasePublicConfig } from '@/lib/supabase/public-key'

export type AdminKpis = {
  health: 'ready' | 'unconfigured' | 'unknown'
  revenueThisMonth: number
  pendingPayments: number
  activeStudents: number
  upcomingBookings: number
  revenueByDay: number[] // last 14 days, oldest first
  revenueByMonth: { label: string; value: number }[] // last 6 months
  bookingsByStatus: { label: string; value: number; color: string }[]
}

export type ApprovalItem = {
  paymentId: string
  orderId: string
  customerName: string
  customerEmail: string
  amount: number
  method: string
  createdAt: string
  productTitles: string[]
  proofPresent: boolean
}

export type RecentCustomer = { id: string; name: string; email: string; joinedAt: string }

export type ScheduleItem = { id: string; title: string; startsAt: string; status: string }

const emptyKpis: AdminKpis = {
  health: 'unconfigured',
  revenueThisMonth: 0,
  pendingPayments: 0,
  activeStudents: 0,
  upcomingBookings: 0,
  revenueByDay: [],
  revenueByMonth: [],
  bookingsByStatus: [],
}

const hasEnv = hasSupabasePublicConfig

const monthFmt = new Intl.DateTimeFormat('ar-EG', { month: 'short' })

export async function getAdminKpis(): Promise<AdminKpis> {
  if (!hasEnv()) return emptyKpis
  try {
    const supabase = await getServerClient()
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1).toISOString()
    const fourteenDaysAgo = new Date(now.getTime() - 13 * 86_400_000)
    fourteenDaysAgo.setHours(0, 0, 0, 0)

    const [paidOrdersRes, pendingRes, studentsRes, bookingsRes, bookingsAllRes] = await Promise.all([
      supabase.from('orders').select('total, created_at').eq('status', 'paid').gte('created_at', sixMonthsAgo),
      supabase.from('payments').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('course_enrollments').select('id', { count: 'exact', head: true }),
      supabase
        .from('bookings')
        .select('id', { count: 'exact', head: true })
        .gte('starts_at', now.toISOString())
        .in('status', ['pending', 'confirmed']),
      supabase.from('bookings').select('status'),
    ])

    const paidOrders = paidOrdersRes.data ?? []
    const revenueThisMonth = paidOrders
      .filter((o) => o.created_at >= monthStart)
      .reduce((s, o) => s + Number(o.total), 0)

    const revenueByDay = Array.from({ length: 14 }, (_, i) => {
      const day = new Date(fourteenDaysAgo.getTime() + i * 86_400_000)
      const next = new Date(day.getTime() + 86_400_000)
      return paidOrders
        .filter((o) => o.created_at >= day.toISOString() && o.created_at < next.toISOString())
        .reduce((s, o) => s + Number(o.total), 0)
    })

    const revenueByMonth = Array.from({ length: 6 }, (_, i) => {
      const m = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1)
      const next = new Date(now.getFullYear(), now.getMonth() - 4 + i, 1)
      return {
        label: monthFmt.format(m),
        value: paidOrders
          .filter((o) => o.created_at >= m.toISOString() && o.created_at < next.toISOString())
          .reduce((s, o) => s + Number(o.total), 0),
      }
    })

    const statusColors: Record<string, { label: string; color: string }> = {
      pending: { label: 'بانتظار التأكيد', color: 'var(--color-antique-gold)' },
      confirmed: { label: 'مؤكدة', color: 'var(--color-deep-teal)' },
      completed: { label: 'مكتملة', color: 'var(--color-cobalt)' },
      cancelled: { label: 'ملغاة', color: 'var(--color-burgundy-soft)' },
      no_show: { label: 'تغيّب', color: 'var(--color-taupe)' },
    }
    const counts = new Map<string, number>()
    for (const b of bookingsAllRes.data ?? []) counts.set(b.status, (counts.get(b.status) ?? 0) + 1)
    const bookingsByStatus = [...counts.entries()].map(([status, value]) => ({
      label: statusColors[status]?.label ?? status,
      value,
      color: statusColors[status]?.color ?? 'var(--color-sand)',
    }))

    return {
      health: 'ready',
      revenueThisMonth,
      pendingPayments: pendingRes.count ?? 0,
      activeStudents: studentsRes.count ?? 0,
      upcomingBookings: bookingsRes.count ?? 0,
      revenueByDay,
      revenueByMonth,
      bookingsByStatus,
    }
  } catch {
    return { ...emptyKpis, health: 'unknown' }
  }
}

export async function getApprovalQueue(limit = 50): Promise<ApprovalItem[]> {
  if (!hasEnv()) return []
  try {
    const supabase = await getServerClient()
    const { data, error } = await supabase
      .from('payments')
      .select(
        'id, order_id, amount, method, created_at, user_id, payment_proofs(id), orders!inner(order_items(products(title)))',
      )
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
      .limit(limit)
    if (error) throw new Error('ADMIN_PAYMENT_QUEUE_UNAVAILABLE')
    if (!data || data.length === 0) return []

    const userIds = [...new Set(data.map((p) => p.user_id))]
    const { data: profiles, error: profilesError } = await supabase.from('profiles').select('id, full_name, email').in('id', userIds)
    if (profilesError) throw new Error('ADMIN_PAYMENT_QUEUE_IDENTITY_UNAVAILABLE')
    const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]))

    return data.map((p) => {
      const order = Array.isArray(p.orders) ? p.orders[0] : p.orders
      const items = (order?.order_items ?? []) as { products: { title: string } | { title: string }[] | null }[]
      const proofs = (p.payment_proofs ?? []) as { id: string }[]
      const profile = profileMap.get(p.user_id)
      return {
        paymentId: p.id,
        orderId: p.order_id,
        customerName: profile?.full_name || 'عميلة',
        customerEmail: profile?.email || '',
        amount: Number(p.amount),
        method: p.method,
        createdAt: p.created_at,
        productTitles: items
          .map((i) => (Array.isArray(i.products) ? i.products[0]?.title : i.products?.title))
          .filter((t): t is string => Boolean(t)),
        proofPresent: proofs.length > 0,
      }
    })
  } catch {
    throw new Error('ADMIN_PAYMENT_QUEUE_READ_UNAVAILABLE')
  }
}

export async function getRecentCustomers(limit = 6): Promise<RecentCustomer[]> {
  if (!hasEnv()) return []
  try {
    const supabase = await getServerClient()
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name, email, created_at')
      .order('created_at', { ascending: false })
      .limit(limit)
    return (data ?? []).map((p) => ({ id: p.id, name: p.full_name || 'عميلة', email: p.email, joinedAt: p.created_at }))
  } catch {
    return []
  }
}

export async function getTodaySchedule(): Promise<ScheduleItem[]> {
  if (!hasEnv()) return []
  try {
    const supabase = await getServerClient()
    const start = new Date()
    start.setHours(0, 0, 0, 0)
    const end = new Date(start.getTime() + 86_400_000)
    const { data } = await supabase
      .from('bookings')
      .select('id, starts_at, status, services!inner(title)')
      .gte('starts_at', start.toISOString())
      .lt('starts_at', end.toISOString())
      .order('starts_at', { ascending: true })
    return (data ?? []).map((b) => {
      const s = Array.isArray(b.services) ? b.services[0] : b.services
      return { id: b.id, title: s?.title ?? 'جلسة', startsAt: b.starts_at, status: b.status }
    })
  } catch {
    return []
  }
}

export type AdminOrder = {
  id: string
  customerName: string
  customerEmail: string
  status: string
  total: number
  createdAt: string
  productTitles: string[]
}

export async function getAdminOrders(status?: string, limit = 100): Promise<AdminOrder[]> {
  if (!hasEnv()) return []
  try {
    const supabase = await getServerClient()
    let query = supabase
      .from('orders')
      .select('id, user_id, status, total, created_at, order_items(products(title))')
      .order('created_at', { ascending: false })
      .limit(limit)
    if (status) query = query.eq('status', status)
    const { data, error } = await query
    if (error) throw new Error('ADMIN_ORDER_LIST_UNAVAILABLE')
    if (!data || data.length === 0) return []

    const userIds = [...new Set(data.map((o) => o.user_id))]
    const { data: profiles, error: profilesError } = await supabase.from('profiles').select('id, full_name, email').in('id', userIds)
    if (profilesError) throw new Error('ADMIN_ORDER_IDENTITIES_UNAVAILABLE')
    const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]))

    return data.map((o) => {
      const items = (o.order_items ?? []) as { products: { title: string } | { title: string }[] | null }[]
      const profile = profileMap.get(o.user_id)
      return {
        id: o.id,
        customerName: profile?.full_name || 'عميلة',
        customerEmail: profile?.email || '',
        status: o.status,
        total: Number(o.total),
        createdAt: o.created_at,
        productTitles: items
          .map((i) => (Array.isArray(i.products) ? i.products[0]?.title : i.products?.title))
          .filter((t): t is string => Boolean(t)),
      }
    })
  } catch {
    throw new Error('ADMIN_ORDER_LIST_READ_UNAVAILABLE')
  }
}

export type AdminCoupon = {
  id: string
  code: string
  kind: string
  value: number
  maxUses: number | null
  maxUsesPerUser: number
  endsAt: string | null
  isActive: boolean
  redemptions: number
}

export async function getAdminCoupons(): Promise<AdminCoupon[]> {
  if (!hasEnv()) return []
  try {
    const supabase = await getServerClient()
    const { data } = await supabase
      .from('coupons')
      .select('id, code, kind, value, max_uses, max_uses_per_user, ends_at, is_active, coupon_redemptions(id)')
      .order('created_at', { ascending: false })
    return (data ?? []).map((c) => ({
      id: c.id,
      code: c.code,
      kind: c.kind,
      value: Number(c.value),
      maxUses: c.max_uses,
      maxUsesPerUser: c.max_uses_per_user,
      endsAt: c.ends_at,
      isActive: c.is_active,
      redemptions: (c.coupon_redemptions ?? []).length,
    }))
  } catch {
    return []
  }
}

export type AdminOffer = {
  id: string
  kind: string
  title: string
  description: string
  badgeText: string | null
  discountKind: string | null
  discountValue: number | null
  startsAt: string
  endsAt: string | null
  isActive: boolean
  targetTypes: string[]
}

export async function getAdminOffers(): Promise<AdminOffer[]> {
  if (!hasEnv()) return []
  try {
    const supabase = await getServerClient()
    const { data } = await supabase
      .from('offers')
      .select('id, kind, title, description, badge_text, discount_kind, discount_value, starts_at, ends_at, is_active, offer_targets(product_type, product_id)')
      .order('created_at', { ascending: false })
    return (data ?? []).map((o) => ({
      id: o.id,
      kind: o.kind,
      title: o.title,
      description: o.description,
      badgeText: o.badge_text,
      discountKind: o.discount_kind,
      discountValue: o.discount_value ? Number(o.discount_value) : null,
      startsAt: o.starts_at,
      endsAt: o.ends_at,
      isActive: o.is_active,
      targetTypes: (o.offer_targets ?? []).map((t) => t.product_type ?? 'منتج محدد').filter(Boolean),
    }))
  } catch {
    return []
  }
}

export async function getPendingPaymentsCount(): Promise<number> {
  if (!hasEnv()) return 0
  try {
    const supabase = await getServerClient()
    const { count } = await supabase.from('payments').select('id', { count: 'exact', head: true }).eq('status', 'pending')
    return count ?? 0
  } catch {
    return 0
  }
}

export async function getAdminBadges() {
  if (!hasEnv()) return { payments: 0, orders: 0, bookings: 0, reviews: 0, messages: 0 }
  try {
    const supabase = await getServerClient()
    const [payments, orders, bookings, reviews, messages] = await Promise.all([
      supabase.from('payments').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('orders').select('id', { count: 'exact', head: true }).in('status', ['pending_payment','awaiting_review']),
      supabase.from('bookings').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('reviews').select('id', { count: 'exact', head: true }).eq('is_approved', false),
      supabase.from('contact_messages').select('id', { count: 'exact', head: true }).eq('status', 'new'),
    ])
    return { payments: payments.count ?? 0, orders: orders.count ?? 0, bookings: bookings.count ?? 0, reviews: reviews.count ?? 0, messages: messages.count ?? 0 }
  } catch { return { payments: 0, orders: 0, bookings: 0, reviews: 0, messages: 0 } }
}
