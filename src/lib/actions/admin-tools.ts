'use server'

import { getServerClient, getServiceClient, hasSupabaseServerSecret } from '@/lib/supabase/server'
import { requirePermission } from '@/lib/auth/permissions'
import { hasSupabasePublicConfig } from '@/lib/supabase/public-key'

type ActionResult<T = null> = { ok: true; data: T } | { ok: false; error: string }

const NO_ENV = 'غير متاح في بيئة العرض التجريبية.'
const NOT_ADMIN = 'هذه العملية تتطلب صلاحية إدارية.'

const hasEnv = () => hasSupabasePublicConfig() && hasSupabaseServerSecret()

export type SearchHit = {
  kind: 'customer' | 'order' | 'payment'
  title: string
  subtitle: string
  href: string
}

// Global admin search: customers by name/email, plus their recent orders/payments.
export async function adminSearch(q: string): Promise<ActionResult<SearchHit[]>> {
  if (!hasEnv()) return { ok: false, error: NO_ENV }
  const admin = await requirePermission('admin.search')
  if (!admin) return { ok: false, error: NOT_ADMIN }

  const term = q.trim()
  if (term.length < 2) return { ok: true, data: [] }

  const supabase = await getServerClient()
  const like = `%${term.replace(/[%_]/g, '')}%`

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name, email')
    .or(`full_name.ilike.${like},email.ilike.${like}`)
    .limit(5)

  const hits: SearchHit[] = (profiles ?? []).map((p) => ({
    kind: 'customer',
    title: p.full_name || p.email,
    subtitle: p.email,
    href: '/admin/users',
  }))

  const ids = (profiles ?? []).map((p) => p.id)
  if (ids.length > 0) {
    const [{ data: orders }, { data: payments }] = await Promise.all([
      supabase
        .from('orders')
        .select('id, status, total, user_id, order_items(products(title))')
        .in('user_id', ids)
        .order('created_at', { ascending: false })
        .limit(5),
      supabase
        .from('payments')
        .select('id, status, amount, user_id')
        .in('user_id', ids)
        .eq('status', 'pending')
        .limit(5),
    ])
    const nameOf = new Map((profiles ?? []).map((p) => [p.id, p.full_name || p.email]))
    for (const o of orders ?? []) {
      const items = (o.order_items ?? []) as { products: { title: string } | { title: string }[] | null }[]
      const titles = items
        .map((i) => (Array.isArray(i.products) ? i.products[0]?.title : i.products?.title))
        .filter(Boolean)
        .join(' + ')
      hits.push({
        kind: 'order',
        title: titles || 'طلب شراء',
        subtitle: `${nameOf.get(o.user_id) ?? ''} · ${o.status}`,
        href: '/admin/orders',
      })
    }
    for (const p of payments ?? []) {
      hits.push({
        kind: 'payment',
        title: `دفعة بانتظار المراجعة — ${Number(p.amount).toLocaleString('ar-EG')} ج.م`,
        subtitle: nameOf.get(p.user_id) ?? '',
        href: '/admin/payments',
      })
    }
  }

  return { ok: true, data: hits.slice(0, 10) }
}

// Send a personal in-app notification to one customer (support tool).
export async function sendUserNotification(userId: string, title: string, body: string): Promise<ActionResult> {
  if (!hasEnv()) return { ok: false, error: NO_ENV }
  const admin = await requirePermission('notifications.send')
  if (!admin) return { ok: false, error: NOT_ADMIN }
  const t = title.trim()
  if (t.length < 3) return { ok: false, error: 'اكتبي عنوان الرسالة.' }

  const service = getServiceClient()
  const { error } = await service.from('notifications').insert({
    user_id: userId,
    title: t,
    body: body.trim(),
    kind: 'info',
    link: '/dashboard/notifications',
  })
  if (error) return { ok: false, error: 'تعذّر الإرسال.' }
  await service.from('audit_logs').insert({
    actor_id: admin.userId,
    action: 'notification.sent',
    entity_type: 'user',
    entity_id: userId,
    meta: { title: t },
  })
  return { ok: true, data: null }
}
