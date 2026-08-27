import { getServerClient } from '@/lib/supabase/server'
import { hasSupabasePublicConfig } from '@/lib/supabase/public-key'

export type HomeOffer = {
  title: string
  description: string
  badgeText: string
  endsAt: string | null
}

export type HomeArticle = {
  slug: string
  title: string
  excerpt: string
  publishedAt: string | null
}

export type HomeTestimonial = {
  displayName: string
  rating: number
  comment: string
}

export type HomePressMention = { id: string; outlet: string; title: string; originalUrl: string; publishedOn: string }
export type HomeResource = { id: string; slug: string; title: string; excerpt: string; kind: string; topic: string }

export type HomeData = {
  offer: HomeOffer | null
  articles: HomeArticle[]
  testimonials: HomeTestimonial[]
  press: HomePressMention[]
  resources: HomeResource[]
}

// Public social proof and promotions are data-only. Missing configuration or
// query failures render honest empty sections instead of invented fallbacks.
const EMPTY_HOME_DATA: HomeData = { offer: null, articles: [], testimonials: [], press: [], resources: [] }

const hasEnv = hasSupabasePublicConfig

export async function getHomeData(): Promise<HomeData> {
  if (!hasEnv()) return EMPTY_HOME_DATA
  try {
    const supabase = await getServerClient()
    const [offerRes, articlesRes, resourcesRes, reviewsRes, pressRes] = await Promise.all([
      supabase
        .from('offers')
        .select('title, description, badge_text, ends_at')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from('articles')
        .select('slug, title, excerpt, published_at')
        .eq('is_published', true)
        .order('published_at', { ascending: false })
        .limit(3),
      supabase
        .from('resources')
        .select('id, slug, title, excerpt, kind, topic')
        .eq('status', 'published')
        .eq('is_featured', true)
        .or(`publish_at.is.null,publish_at.lte.${new Date().toISOString()}`)
        .order('publish_at', { ascending: false })
        .limit(3),
      supabase
        .from('reviews')
        .select('display_name, display_name_consent, rating, comment')
        .eq('status', 'approved')
        .eq('is_approved', true)
        .eq('is_featured', true)
        .eq('verified_purchase', true)
        .not('publication_consent_at', 'is', null)
        .limit(6),
      supabase
        .from('press_mentions')
        .select('id, outlet, title, original_url, published_on')
        .eq('status', 'published')
        .eq('is_featured', true)
        .or(`publish_at.is.null,publish_at.lte.${new Date().toISOString()}`)
        .order('published_on', { ascending: false })
        .limit(3),
    ])

    // Missing rows remain absent and their sections hide themselves.
    return {
      offer: offerRes.data
        ? {
            title: offerRes.data.title,
            description: offerRes.data.description,
            badgeText: offerRes.data.badge_text ?? '',
            endsAt: offerRes.data.ends_at,
          }
        : null,
      articles: (articlesRes.data ?? []).map((a) => ({
        slug: a.slug,
        title: a.title,
        excerpt: a.excerpt,
        publishedAt: a.published_at,
      })),
      testimonials: (reviewsRes.data ?? []).map((r) => ({
        displayName: r.display_name_consent && r.display_name ? r.display_name : 'عميلة موثقة',
        rating: r.rating,
        comment: r.comment,
      })),
      press: (pressRes.data ?? []).map((row) => ({ id: row.id, outlet: row.outlet, title: row.title, originalUrl: row.original_url, publishedOn: row.published_on })),
      resources: (resourcesRes.data ?? []).map((row) => ({ id: row.id, slug: row.slug, title: row.title, excerpt: row.excerpt, kind: row.kind, topic: row.topic })),
    }
  } catch {
    return EMPTY_HOME_DATA
  }
}
