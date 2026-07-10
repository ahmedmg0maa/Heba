import { getServerClient } from '@/lib/supabase/server'

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

export type HomeData = {
  offer: HomeOffer | null
  articles: HomeArticle[]
  testimonials: HomeTestimonial[]
}

// Editorial fallbacks keep the page premium when Supabase env isn't configured
// (local dev before credentials) or a query fails. Same shapes as seeded data.
// The fallback offer gets a rolling 7-day window computed at request time in
// getHomeData (data layer, not component render) so the countdown stays live.
const fallback: HomeData = {
  offer: {
    title: 'خصم إطلاق المنصة',
    description: 'خصم ٣٠٪ على جميع الدورات التدريبية لفترة محدودة — ابدئي رحلتك اليوم.',
    badgeText: 'خصم ٣٠٪',
    endsAt: null,
  },
  articles: [
    {
      slug: 'five-morning-questions',
      title: 'خمسة أسئلة تفتح صباحك',
      excerpt: 'أسئلة صباحية قصيرة تغيّر جودة يومك كاملة.',
      publishedAt: null,
    },
    {
      slug: 'quiet-no',
      title: 'فن الرفض الهادئ',
      excerpt: 'كيف تقولين لا بوضوح ولطف في آن واحد.',
      publishedAt: null,
    },
    {
      slug: 'energy-audit',
      title: 'جرد الطاقة الأسبوعي',
      excerpt: 'تمرين نصف ساعة يكشف أين تذهب طاقتك فعلًا.',
      publishedAt: null,
    },
  ],
  testimonials: [
    { displayName: 'سارة م.', rating: 5, comment: 'الدورة غيرت علاقتي بنفسي فعلًا. التمارين عملية والشرح هادئ وواضح.' },
    { displayName: 'نورهان ع.', rating: 5, comment: 'أفضل استثمار عملته في نفسي هذه السنة. أنصح بها كل امرأة تشعر بالاستنزاف.' },
    { displayName: 'مريم أ.', rating: 4, comment: 'تعلمت أقول لا بدون ذنب لأول مرة في حياتي. القوالب الجاهزة كنز حقيقي.' },
  ],
}

const hasEnv = () =>
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

function withLiveFallbackOffer(data: HomeData): HomeData {
  if (data.offer && !data.offer.endsAt) {
    return { ...data, offer: { ...data.offer, endsAt: new Date(Date.now() + 7 * 86_400_000).toISOString() } }
  }
  return data
}

export async function getHomeData(): Promise<HomeData> {
  if (!hasEnv()) return withLiveFallbackOffer(fallback)
  try {
    const supabase = await getServerClient()
    const [offerRes, articlesRes, reviewsRes] = await Promise.all([
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
        .from('reviews')
        .select('display_name, rating, comment')
        .eq('is_approved', true)
        .eq('is_featured', true)
        .limit(6),
    ])

    // Live database: empty results stay empty (sections hide themselves) —
    // editorial fallbacks are for the no-env demo and error paths only.
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
        displayName: r.display_name ?? 'متعلّمة',
        rating: r.rating,
        comment: r.comment,
      })),
    }
  } catch {
    return withLiveFallbackOffer(fallback)
  }
}
