import { getServerClient } from '@/lib/supabase/server'

export type CatalogCourse = {
  slug: string
  title: string
  subtitle: string
  description: string
  price: number
  compareAtPrice: number | null
  level: string
  durationMinutes: number
  lessonsCount: number
  rating: number
  ratingCount: number
  modules: { title: string; lessons: { title: string; durationSeconds: number; isPreview: boolean }[] }[]
}

export type CatalogBook = {
  slug: string
  title: string
  subtitle: string
  description: string
  price: number
  compareAtPrice: number | null
  pagesCount: number | null
}

export type CatalogWorkshop = {
  slug: string
  title: string
  subtitle: string
  description: string
  price: number
  compareAtPrice: number | null
  startsAt: string
  endsAt: string
  seatsTotal: number
  seatsReserved: number
  locationKind: string
}

export type CatalogService = {
  slug: string
  title: string
  subtitle: string
  description: string
  price: number
  durationMinutes: number
  availability: { weekday: number; startTime: string; endTime: string }[]
}

export type CatalogArticle = {
  slug: string
  title: string
  excerpt: string
  content: string
  publishedAt: string | null
}

// ——— Editorial fallbacks (mirror supabase/seed.sql shapes) ———

const fallbackCourses: CatalogCourse[] = [
  {
    slug: 'conscious-selfcare',
    title: 'رحلة العناية الواعية بالذات',
    subtitle: 'برنامج تدريبي متكامل من ٨ وحدات',
    description:
      'برنامج عملي يمتد ثمانية أسابيع لبناء علاقة صحية مع ذاتك: وعي، حدود، تعاطف ذاتي، وطقوس يومية مستدامة.',
    price: 1800,
    compareAtPrice: 2400,
    level: 'all',
    durationMinutes: 540,
    lessonsCount: 5,
    rating: 5,
    ratingCount: 214,
    modules: [
      {
        title: 'الوحدة الأولى: أين أنا الآن؟',
        lessons: [
          { title: 'أهلًا بك في الرحلة', durationSeconds: 420, isPreview: true },
          { title: 'خريطة الطاقة اليومية', durationSeconds: 1260, isPreview: false },
        ],
      },
      {
        title: 'الوحدة الثانية: صوت الناقد الداخلي',
        lessons: [
          { title: 'التعرف على صوت الناقد', durationSeconds: 1080, isPreview: false },
          { title: 'تمرين الرسالة المتعاطفة', durationSeconds: 900, isPreview: false },
        ],
      },
      {
        title: 'الوحدة الثالثة: طقوس صغيرة، أثر كبير',
        lessons: [{ title: 'تصميم طقسك الصباحي', durationSeconds: 1140, isPreview: false }],
      },
    ],
  },
  {
    slug: 'calm-boundaries',
    title: 'فن الحدود الهادئة',
    subtitle: 'قولي لا دون شعور بالذنب',
    description: 'دورة مركزة تتعلمين فيها بناء حدود واضحة في العلاقات والعمل بلغة هادئة وواثقة.',
    price: 950,
    compareAtPrice: null,
    level: 'all',
    durationMinutes: 240,
    lessonsCount: 2,
    rating: 4.8,
    ratingCount: 96,
    modules: [
      {
        title: 'الوحدة الأولى: لماذا نعجز عن قول لا؟',
        lessons: [{ title: 'جذور المجاملة المفرطة', durationSeconds: 960, isPreview: true }],
      },
      {
        title: 'الوحدة الثانية: لغة الحدود الهادئة',
        lessons: [{ title: 'قوالب حوار جاهزة', durationSeconds: 1320, isPreview: false }],
      },
    ],
  },
]

const fallbackBooks: CatalogBook[] = [
  {
    slug: 'sabah-alwaey',
    title: 'كتاب صباح الوعي',
    subtitle: '٩٠ يومًا من التأملات الصباحية',
    description:
      'كتاب رقمي يرافقك كل صباح بتأمل قصير وسؤال للتدوين وممارسة صغيرة تفتح يومك بوعي.',
    price: 220,
    compareAtPrice: 320,
    pagesCount: 210,
  },
  {
    slug: 'khatawat-alhudu',
    title: 'كتاب خطوات الهدوء',
    subtitle: 'دليلك العملي لإدارة القلق',
    description: 'أدوات مجرّبة ومبسطة للتعامل مع القلق اليومي، بتمارين تطبيقية ونماذج جاهزة للتدوين.',
    price: 180,
    compareAtPrice: null,
    pagesCount: 156,
  },
]

function fallbackWorkshops(): CatalogWorkshop[] {
  const starts = new Date(Date.now() + 14 * 86_400_000)
  const ends = new Date(starts.getTime() + 3 * 3_600_000)
  return [
    {
      slug: 'tawazun-workshop',
      title: 'ورشة التوازن بين العمل والحياة',
      subtitle: 'ورشة مباشرة أونلاين — ٣ ساعات',
      description: 'ورشة تفاعلية مباشرة نبني فيها معًا خريطة توازنك الشخصية ونصمم أسبوعًا واقعيًا يشبهك.',
      price: 450,
      compareAtPrice: 600,
      startsAt: starts.toISOString(),
      endsAt: ends.toISOString(),
      seatsTotal: 30,
      seatsReserved: 12,
      locationKind: 'online',
    },
  ]
}

const fallbackServices: CatalogService[] = [
  {
    slug: 'clarity-session',
    title: 'جلسة وضوح فردية',
    subtitle: '٦٠ دقيقة — أونلاين',
    description:
      'جلسة فردية معمقة نفكك فيها التحدي الذي يشغلك ونخرج بخطة عملية واضحة لخطوتك التالية.',
    price: 700,
    durationMinutes: 60,
    availability: [
      { weekday: 0, startTime: '10:00', endTime: '14:00' },
      { weekday: 2, startTime: '10:00', endTime: '14:00' },
      { weekday: 4, startTime: '16:00', endTime: '20:00' },
    ],
  },
]

const fallbackArticles: CatalogArticle[] = [
  {
    slug: 'five-morning-questions',
    title: 'خمسة أسئلة تفتح صباحك',
    excerpt: 'أسئلة صباحية قصيرة تغيّر جودة يومك كاملة.',
    content:
      'ابدئي يومك بخمس دقائق من التدوين الحر حول هذه الأسئلة الخمسة: ماذا يحتاج جسدي اليوم؟ ما الشيء الواحد الذي لو أنجزته لشعرت بالرضا؟ ممّ أحتاج أن أتحرر هذا الصباح؟ من أودّ أن أشكر؟ وكيف أريد أن أشعر عند النوم الليلة؟ لا تبحثي عن إجابات مثالية — دعي القلم يسبق التفكير. مع الأيام ستلاحظين أن هذه الدقائق الخمس تعيد ترتيب يومك كاملًا.',
    publishedAt: null,
  },
  {
    slug: 'quiet-no',
    title: 'فن الرفض الهادئ',
    excerpt: 'كيف تقولين لا بوضوح ولطف في آن واحد.',
    content:
      'الرفض ليس قسوة؛ إنه وضوح. ثلاث خطوات عملية: أولًا، اشكري الطلب نفسه («سعيدة إنك فكرتي فيّ»). ثانيًا، ارفضي الفعل لا الشخص («مش هقدر ألتزم بده دلوقتي»). ثالثًا — وهنا السر — توقفي عن الكلام. لا تبرري أكثر من جملة واحدة؛ التبرير الزائد دعوة مفتوحة للتفاوض. الحدود الهادئة تُبنى بالتكرار، لا بالمواجهة.',
    publishedAt: null,
  },
  {
    slug: 'energy-audit',
    title: 'جرد الطاقة الأسبوعي',
    excerpt: 'تمرين نصف ساعة يكشف أين تذهب طاقتك فعلًا.',
    content:
      'خصصي ثلاثين دقيقة نهاية كل أسبوع لهذا الجرد البسيط: ارسمي عمودين — «ملأني» و«استنزفني». مرّي على أيام الأسبوع في ذهنك وسجّلي كل نشاط ولقاء تحت عموده. بعد ثلاثة أسابيع ستظهر الأنماط بوضوح: أشخاص وأنشطة تتكرر في عمود الاستنزاف. حينها يبدأ السؤال الحقيقي: ما الذي يمكن تقليصه أو حذفه أو إعادة تصميمه؟',
    publishedAt: null,
  },
]

const hasEnv = () =>
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

// ——— Queries (fallback-first pattern like home.ts) ———

export async function listCourses(): Promise<CatalogCourse[]> {
  if (!hasEnv()) return fallbackCourses
  try {
    const supabase = await getServerClient()
    const { data } = await supabase
      .from('courses')
      .select(
        'slug, title, description, level, duration_minutes, products!inner(subtitle, price, compare_at_price, is_published), course_modules(title, sort, course_lessons(title, duration_seconds, sort, is_preview))',
      )
      .eq('is_published', true)
    if (!data) return fallbackCourses
    return data.map((c) => {
      const product = Array.isArray(c.products) ? c.products[0] : c.products
      const modules = (c.course_modules ?? [])
        .sort((a, b) => a.sort - b.sort)
        .map((m) => ({
          title: m.title,
          lessons: (m.course_lessons ?? [])
            .sort((a, b) => a.sort - b.sort)
            .map((l) => ({ title: l.title, durationSeconds: l.duration_seconds, isPreview: l.is_preview })),
        }))
      return {
        slug: c.slug,
        title: c.title,
        subtitle: product?.subtitle ?? '',
        description: c.description,
        price: Number(product?.price ?? 0),
        compareAtPrice: product?.compare_at_price ? Number(product.compare_at_price) : null,
        level: c.level,
        durationMinutes: c.duration_minutes,
        lessonsCount: modules.reduce((n, m) => n + m.lessons.length, 0),
        rating: 5,
        ratingCount: 0,
        modules,
      }
    })
  } catch {
    return fallbackCourses
  }
}

export async function getCourse(slug: string): Promise<CatalogCourse | null> {
  const all = await listCourses()
  return all.find((c) => c.slug === slug) ?? null
}

export async function listBooks(): Promise<CatalogBook[]> {
  if (!hasEnv()) return fallbackBooks
  try {
    const supabase = await getServerClient()
    const { data } = await supabase
      .from('books')
      .select('slug, title, description, pages_count, products!inner(subtitle, price, compare_at_price)')
      .eq('is_published', true)
    if (!data) return fallbackBooks
    return data.map((b) => {
      const product = Array.isArray(b.products) ? b.products[0] : b.products
      return {
        slug: b.slug,
        title: b.title,
        subtitle: product?.subtitle ?? '',
        description: b.description,
        price: Number(product?.price ?? 0),
        compareAtPrice: product?.compare_at_price ? Number(product.compare_at_price) : null,
        pagesCount: b.pages_count,
      }
    })
  } catch {
    return fallbackBooks
  }
}

export async function getBook(slug: string): Promise<CatalogBook | null> {
  const all = await listBooks()
  return all.find((b) => b.slug === slug) ?? null
}

export async function listWorkshops(): Promise<CatalogWorkshop[]> {
  if (!hasEnv()) return fallbackWorkshops()
  try {
    const supabase = await getServerClient()
    const { data } = await supabase
      .from('workshops')
      .select(
        'slug, title, description, starts_at, ends_at, seats_total, seats_reserved, location_kind, products!inner(subtitle, price, compare_at_price)',
      )
      .eq('is_published', true)
      .order('starts_at', { ascending: true })
    if (!data) return fallbackWorkshops()
    return data.map((w) => {
      const product = Array.isArray(w.products) ? w.products[0] : w.products
      return {
        slug: w.slug,
        title: w.title,
        subtitle: product?.subtitle ?? '',
        description: w.description,
        price: Number(product?.price ?? 0),
        compareAtPrice: product?.compare_at_price ? Number(product.compare_at_price) : null,
        startsAt: w.starts_at,
        endsAt: w.ends_at,
        seatsTotal: w.seats_total,
        seatsReserved: w.seats_reserved,
        locationKind: w.location_kind,
      }
    })
  } catch {
    return fallbackWorkshops()
  }
}

export async function getWorkshop(slug: string): Promise<CatalogWorkshop | null> {
  const all = await listWorkshops()
  return all.find((w) => w.slug === slug) ?? null
}

export async function listServices(): Promise<CatalogService[]> {
  if (!hasEnv()) return fallbackServices
  try {
    const supabase = await getServerClient()
    const { data } = await supabase
      .from('services')
      .select('slug, title, description, duration_minutes, price, products!inner(subtitle), availability_rules(weekday, start_time, end_time)')
      .eq('is_active', true)
    if (!data) return fallbackServices
    return data.map((s) => {
      const product = Array.isArray(s.products) ? s.products[0] : s.products
      return {
        slug: s.slug,
        title: s.title,
        subtitle: product?.subtitle ?? '',
        description: s.description,
        price: Number(s.price),
        durationMinutes: s.duration_minutes,
        availability: (s.availability_rules ?? []).map((r) => ({
          weekday: r.weekday,
          startTime: r.start_time,
          endTime: r.end_time,
        })),
      }
    })
  } catch {
    return fallbackServices
  }
}

export async function listArticles(): Promise<CatalogArticle[]> {
  if (!hasEnv()) return fallbackArticles
  try {
    const supabase = await getServerClient()
    const { data } = await supabase
      .from('articles')
      .select('slug, title, excerpt, content, published_at')
      .eq('is_published', true)
      .order('published_at', { ascending: false })
    if (!data) return fallbackArticles
    return data.map((a) => ({
      slug: a.slug,
      title: a.title,
      excerpt: a.excerpt,
      content: a.content,
      publishedAt: a.published_at,
    }))
  } catch {
    return fallbackArticles
  }
}

export async function getArticle(slug: string): Promise<CatalogArticle | null> {
  const all = await listArticles()
  return all.find((a) => a.slug === slug) ?? null
}

// Formatting helpers live in '@/lib/format' (client-safe); re-exported here for server pages.
export { formatPrice, formatDuration, weekdayNames } from '../format'
