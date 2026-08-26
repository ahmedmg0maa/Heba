import { getServerClient } from '@/lib/supabase/server'
import { hasSupabasePublicConfig } from '@/lib/supabase/public-key'

export type RevenueReport = {
  byMonth: { label: string; revenue: number; orders: number }[]
  byType: { type: string; revenue: number; orders: number }[]
  total: number
}

export type EnrollmentReport = {
  courses: { title: string; enrollments: number; avgPercent: number; completions: number }[]
  total: number
}

export type BookingsReport = {
  byStatus: { status: string; count: number }[]
  total: number
}

export type MembershipReport = {
  active: number
  total: number
  byPlan: { title: string; active: number; total: number }[]
}

export type Snapshot = { id: string; kind: string; periodStart: string; periodEnd: string; createdAt: string }

export type ReportsBundle = {
  state: 'ready' | 'unconfigured' | 'error'
  revenue: RevenueReport
  enrollments: EnrollmentReport
  bookings: BookingsReport
  memberships: MembershipReport
  snapshots: Snapshot[]
}

const empty: ReportsBundle = {
  state: 'ready',
  revenue: { byMonth: [], byType: [], total: 0 },
  enrollments: { courses: [], total: 0 },
  bookings: { byStatus: [], total: 0 },
  memberships: { active: 0, total: 0, byPlan: [] },
  snapshots: [],
}

const hasEnv = hasSupabasePublicConfig

const monthFmt = new Intl.DateTimeFormat('ar-EG', { month: 'long', year: 'numeric' })

export async function getReports(): Promise<ReportsBundle> {
  if (!hasEnv()) return { ...empty, state: 'unconfigured' }
  try {
    const supabase = await getServerClient()
    const now = new Date()
    const yearAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1)

    const [ordersRes, itemsRes, coursesRes, progressRes, bookingsRes, snapshotsRes, plansRes] = await Promise.all([
      supabase
        .from('orders')
        .select('id, total, created_at')
        .eq('status', 'paid')
        .gte('created_at', yearAgo.toISOString()),
      // order_items has no created_at — filtered against year-scoped paid order ids below
      supabase.from('order_items').select('order_id, total, products!inner(type)').limit(5000),
      supabase.from('courses').select('id, title, course_enrollments(id)'),
      supabase.from('course_progress').select('course_id, percent'),
      supabase.from('bookings').select('status'),
      supabase
        .from('report_snapshots')
        .select('id, kind, period_start, period_end, created_at')
        .order('created_at', { ascending: false })
        .limit(12),
      supabase.from('subscription_plans').select('id, title, subscriptions(id, status)'),
    ])

    if ([ordersRes, itemsRes, coursesRes, progressRes, bookingsRes, snapshotsRes, plansRes].some((result) => result.error)) {
      return { ...empty, state: 'error' }
    }

    const paidOrders = ordersRes.data ?? []
    const paidIds = new Set(paidOrders.map((o) => o.id))
    const total = paidOrders.reduce((s, o) => s + Number(o.total), 0)

    const byMonth = Array.from({ length: 12 }, (_, i) => {
      const m = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1)
      const next = new Date(now.getFullYear(), now.getMonth() - 10 + i, 1)
      const slice = paidOrders.filter((o) => o.created_at >= m.toISOString() && o.created_at < next.toISOString())
      return {
        label: monthFmt.format(m),
        revenue: slice.reduce((s, o) => s + Number(o.total), 0),
        orders: slice.length,
      }
    }).filter((m) => m.orders > 0)

    const typeAgg = new Map<string, { revenue: number; orders: number }>()
    for (const item of itemsRes.data ?? []) {
      if (!paidIds.has(item.order_id)) continue
      const product = Array.isArray(item.products) ? item.products[0] : item.products
      const type = product?.type ?? 'other'
      const agg = typeAgg.get(type) ?? { revenue: 0, orders: 0 }
      agg.revenue += Number(item.total)
      agg.orders += 1
      typeAgg.set(type, agg)
    }
    const byType = [...typeAgg.entries()]
      .map(([type, v]) => ({ type, ...v }))
      .sort((a, b) => b.revenue - a.revenue)

    const progressByCourse = new Map<string, number[]>()
    for (const p of progressRes.data ?? []) {
      const arr = progressByCourse.get(p.course_id) ?? []
      arr.push(Number(p.percent))
      progressByCourse.set(p.course_id, arr)
    }
    const courses = (coursesRes.data ?? [])
      .map((c) => {
        const percents = progressByCourse.get(c.id) ?? []
        return {
          title: c.title,
          enrollments: (c.course_enrollments ?? []).length,
          avgPercent: percents.length ? Math.round(percents.reduce((s, p) => s + p, 0) / percents.length) : 0,
          completions: percents.filter((p) => p >= 100).length,
        }
      })
      .sort((a, b) => b.enrollments - a.enrollments)

    const statusAgg = new Map<string, number>()
    for (const b of bookingsRes.data ?? []) statusAgg.set(b.status, (statusAgg.get(b.status) ?? 0) + 1)
    const membershipByPlan = (plansRes.data ?? []).map((plan) => {
      const rows = plan.subscriptions ?? []
      return { title: plan.title, active: rows.filter((row) => row.status === 'active').length, total: rows.length }
    })

    return {
      state: 'ready',
      revenue: { byMonth, byType, total },
      enrollments: { courses, total: courses.reduce((s, c) => s + c.enrollments, 0) },
      bookings: {
        byStatus: [...statusAgg.entries()].map(([status, count]) => ({ status, count })),
        total: bookingsRes.data?.length ?? 0,
      },
      memberships: {
        active: membershipByPlan.reduce((sum, plan) => sum + plan.active, 0),
        total: membershipByPlan.reduce((sum, plan) => sum + plan.total, 0),
        byPlan: membershipByPlan,
      },
      snapshots: (snapshotsRes.data ?? []).map((s) => ({
        id: s.id,
        kind: s.kind,
        periodStart: s.period_start,
        periodEnd: s.period_end,
        createdAt: s.created_at,
      })),
    }
  } catch {
    return { ...empty, state: 'error' }
  }
}
