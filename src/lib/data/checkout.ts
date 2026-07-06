import { getServerClient } from '@/lib/supabase/server'
import { listBooks, listCourses, listServices, listWorkshops } from './catalog'

export const PRODUCT_TYPES = ['book', 'course', 'workshop', 'session', 'bundle', 'vip', 'free_resource'] as const
export type ProductType = (typeof PRODUCT_TYPES)[number]

export type CheckoutProduct = {
  id: string | null // null in fallback (no-env) mode — ordering disabled
  type: ProductType
  slug: string
  title: string
  subtitle: string
  price: number
  compareAtPrice: number | null
  currency: string
}

export type PaymentSettings = {
  instapay: { handle: string; name: string }
  wallet: { number: string; provider: string }
  bank: { bank: string; iban: string; name: string }
  expiryHours: number
}

const fallbackSettings: PaymentSettings = {
  instapay: { handle: 'heba@instapay', name: 'هبة الشريف' },
  wallet: { number: '01000000000', provider: 'فودافون كاش' },
  bank: { bank: 'البنك الأهلي المصري', iban: 'EG000000000000000000000000000', name: 'هبة الشريف' },
  expiryHours: 72,
}

const hasEnv = () =>
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

export async function getPaymentSettings(): Promise<PaymentSettings> {
  if (!hasEnv()) return fallbackSettings
  try {
    const supabase = await getServerClient()
    const { data } = await supabase
      .from('site_settings')
      .select('key, value')
      .in('key', ['payment_instapay', 'payment_wallet', 'payment_bank', 'order_expiry_hours'])
    const map = Object.fromEntries((data ?? []).map((r) => [r.key, r.value]))
    return {
      instapay: map.payment_instapay ?? fallbackSettings.instapay,
      wallet: map.payment_wallet ?? fallbackSettings.wallet,
      bank: map.payment_bank ?? fallbackSettings.bank,
      expiryHours: map.order_expiry_hours?.hours ?? fallbackSettings.expiryHours,
    }
  } catch {
    return fallbackSettings
  }
}

async function fallbackProduct(type: ProductType, slug: string): Promise<CheckoutProduct | null> {
  const base = { id: null, type, slug, currency: 'EGP' }
  if (type === 'course') {
    const c = (await listCourses()).find((x) => x.slug === slug)
    return c ? { ...base, title: c.title, subtitle: c.subtitle, price: c.price, compareAtPrice: c.compareAtPrice } : null
  }
  if (type === 'book') {
    const b = (await listBooks()).find((x) => x.slug === slug)
    return b ? { ...base, title: b.title, subtitle: b.subtitle, price: b.price, compareAtPrice: b.compareAtPrice } : null
  }
  if (type === 'workshop') {
    const w = (await listWorkshops()).find((x) => x.slug === slug)
    return w ? { ...base, title: w.title, subtitle: w.subtitle, price: w.price, compareAtPrice: w.compareAtPrice } : null
  }
  if (type === 'session') {
    const s = (await listServices()).find((x) => x.slug === slug)
    return s ? { ...base, title: s.title, subtitle: s.subtitle, price: s.price, compareAtPrice: null } : null
  }
  return null
}

export async function getCheckoutProduct(type: string, slug: string): Promise<CheckoutProduct | null> {
  if (!PRODUCT_TYPES.includes(type as ProductType)) return null
  const t = type as ProductType
  if (!hasEnv()) return fallbackProduct(t, slug)
  try {
    const supabase = await getServerClient()
    const { data } = await supabase
      .from('products')
      .select('id, type, slug, title, subtitle, price, compare_at_price, currency')
      .eq('slug', slug)
      .eq('type', t)
      .eq('is_published', true)
      .maybeSingle()
    if (!data) return fallbackProduct(t, slug)
    return {
      id: data.id,
      type: t,
      slug: data.slug,
      title: data.title,
      subtitle: data.subtitle ?? '',
      price: Number(data.price),
      compareAtPrice: data.compare_at_price ? Number(data.compare_at_price) : null,
      currency: data.currency,
    }
  } catch {
    return fallbackProduct(t, slug)
  }
}
