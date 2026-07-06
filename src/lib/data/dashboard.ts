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

const hasEnv = () =>
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

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
