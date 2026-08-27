import { getServerClient } from '@/lib/supabase/server'
import { hasSupabasePublicConfig } from '@/lib/supabase/public-key'
import { listBooks, listCourses, listServices, listWorkshops } from './catalog'
import { getPublishedProgram } from './programs'

export const PRODUCT_TYPES = ['book', 'course', 'workshop', 'session', 'bundle', 'vip', 'free_resource'] as const
export type ProductType = (typeof PRODUCT_TYPES)[number]

export type CheckoutProduct = {
  id: string | null // null without public configuration — ordering is disabled
  type: ProductType
  slug: string
  title: string
  subtitle: string
  price: number // effective price after any active offer
  compareAtPrice: number | null
  currency: string
  offerLabel: string | null // e.g. "خصم ٣٠٪ — عرض الإطلاق"
  variants: { id: string; name: string; price: number }[]
}

export type ActiveOffer = {
  id: string
  title: string
  badgeText: string | null
  discountKind: 'percent' | 'fixed'
  discountValue: number
}

// Find the best active offer targeting this product (by id, type, or global target row).
export async function resolveActiveOffer(productId: string, productType: string): Promise<ActiveOffer | null> {
  try {
    const supabase = await getServerClient()
    const nowIso = new Date().toISOString()
    const { data: offers } = await supabase
      .from('offers')
      .select('id, title, badge_text, discount_kind, discount_value, offer_targets(product_id, product_type)')
      .eq('is_active', true)
      .lte('starts_at', nowIso)
      .or(`ends_at.is.null,ends_at.gt.${nowIso}`)
    if (!offers) return null

    const matching = offers.filter((o) => {
      if (!o.discount_kind || !o.discount_value) return false
      const targets = o.offer_targets ?? []
      if (targets.length === 0) return true // untargeted → applies to everything
      return targets.some((t) => t.product_id === productId || t.product_type === productType)
    })
    if (matching.length === 0) return null

    // Best offer = biggest percent first, then biggest fixed.
    matching.sort((a, b) => {
      if (a.discount_kind === b.discount_kind) return Number(b.discount_value) - Number(a.discount_value)
      return a.discount_kind === 'percent' ? -1 : 1
    })
    const best = matching[0]
    return {
      id: best.id,
      title: best.title,
      badgeText: best.badge_text,
      discountKind: best.discount_kind as 'percent' | 'fixed',
      discountValue: Number(best.discount_value),
    }
  } catch {
    return null
  }
}

export function applyOffer(price: number, offer: ActiveOffer | null): number {
  if (!offer) return price
  const discounted =
    offer.discountKind === 'percent' ? price * (1 - offer.discountValue / 100) : price - offer.discountValue
  return Math.max(0, Math.round(discounted * 100) / 100)
}

export type PaymentSettings = {
  instapay: { handle: string; name: string } | null
  wallet: { number: string; provider: string } | null
  bank: { bank: string; iban: string; name: string } | null
  expiryHours: number
}

const defaultSettings: PaymentSettings = {
  instapay: null,
  wallet: null,
  bank: null,
  expiryHours: 72,
}

const hasEnv = hasSupabasePublicConfig

export async function getPaymentSettings(): Promise<PaymentSettings> {
  if (!hasEnv()) return defaultSettings
  try {
    const supabase = await getServerClient()
    const { data } = await supabase
      .from('site_settings')
      .select('key, value')
      .in('key', ['payment_instapay', 'payment_wallet', 'payment_bank', 'order_expiry_hours'])
    const map = Object.fromEntries((data ?? []).map((r) => [r.key, r.value]))
    return {
      // Live database: unconfigured methods are null so checkout hides them —
      // never show fabricated account details for real payments.
      instapay: map.payment_instapay ?? null,
      wallet: map.payment_wallet ?? null,
      bank: map.payment_bank ?? null,
      expiryHours: map.order_expiry_hours?.hours ?? defaultSettings.expiryHours,
    }
  } catch {
    return defaultSettings
  }
}

async function getCatalogProduct(type: ProductType, slug: string): Promise<CheckoutProduct | null> {
  const base = { id: null, type, slug, currency: 'EGP', offerLabel: null, variants: [] }
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
  if (t === 'free_resource') return null
  if ((t === 'bundle' || t === 'vip') && !(await getPublishedProgram(t, slug))) return null
  if (!hasEnv()) return getCatalogProduct(t, slug)
  try {
    const supabase = await getServerClient()
    const { data } = await supabase
      .from('products')
      .select('id, type, slug, title, subtitle, price, compare_at_price, currency, product_variants(id, name, price, is_active)')
      .eq('slug', slug)
      .eq('type', t)
      .eq('is_published', true)
      .maybeSingle()
    // Unknown products remain absent rather than producing an invented purchasable item.
    if (!data) return null
    if (t === 'course' && !(await listCourses()).some((item) => item.slug === slug)) return null
    if (t === 'book' && !(await listBooks()).some((item) => item.slug === slug)) return null
    if (t === 'workshop') {
      const workshop = (await listWorkshops()).find((item) => item.slug === slug)
      if (!workshop || new Date(workshop.endsAt).getTime() <= Date.now() || workshop.seatsTotal < 1 || workshop.seatsReserved >= workshop.seatsTotal) return null
    }
    if (t === 'session') {
      const session = (await listServices()).find((item) => item.slug === slug)
      if (!session || session.availability.length === 0) return null
    }
    const listPrice = Number(data.price)
    const offer = await resolveActiveOffer(data.id, t)
    const effective = applyOffer(listPrice, offer)
    return {
      id: data.id,
      type: t,
      slug: data.slug,
      title: data.title,
      subtitle: data.subtitle ?? '',
      price: effective,
      // show the list price struck through when an offer applies
      compareAtPrice: offer && effective < listPrice ? listPrice : data.compare_at_price ? Number(data.compare_at_price) : null,
      currency: data.currency,
      offerLabel: offer ? (offer.badgeText ? `${offer.badgeText} — ${offer.title}` : offer.title) : null,
      variants: (data.product_variants ?? []).filter((variant) => variant.is_active).map((variant) => ({ id: variant.id, name: variant.name, price: applyOffer(Number(variant.price), offer) })),
    }
  } catch {
    return getCatalogProduct(t, slug)
  }
}
