export type StartHereContent = {
  hero: { eyebrow: string; title: string; lead: string }
  paths: { title: string; text: string; href: string; cta: string }[]
  closing: { title: string; lead: string; ctaLabel: string; ctaHref: string }
}

export const defaultStartHereContent: StartHereContent = {
  hero: {
    eyebrow: 'ابدئي من هنا',
    title: 'أين أنتِ الآن؟',
    lead: 'اختاري الجملة الأقرب لحالك اليوم لتحصلي على ترشيح إرشادي لمسار عام، وليس توصية شخصية أو علاجية.',
  },
  paths: [
    { title: 'أشعر بالاستنزاف ولا أعرف من أين أبدأ', text: 'استعرضي الدورات المنشورة واقرئي وصف كل مسار قبل اختيار ما يناسبك.', href: '/courses', cta: 'استكشفي الدورات' },
    { title: 'أعاني من قول «لا» ومن حدود مهزوزة', text: 'تصفحي المقالات والدورات المنشورة؛ التفاصيل الفعلية فقط هي ما يظهر قبل الاختيار.', href: '/articles', cta: 'اقرئي المقالات' },
    { title: 'أفضّل البدء بشيء صغير وخفيف', text: 'تظهر الكتب المنشورة هنا مع وصفها وتفاصيل الوصول الخاصة بكل كتاب.', href: '/books', cta: 'تصفحي الكتب' },
    { title: 'أحتاج من يسمعني ويساعدني أرتب أفكاري', text: 'تظهر خدمات الجلسات ومواعيدها فقط عند نشرها وتفعيل التوافر من الإدارة.', href: '/booking', cta: 'احجزي جلستك' },
  ],
  closing: { title: 'ما زلتِ محتارة؟', lead: 'استخدمي نموذج التواصل عند تهيئته إذا احتجتِ إلى سؤال عن خدمة منشورة.', ctaLabel: 'تواصلي معنا', ctaHref: '/contact' },
}

const object = (value: unknown): Record<string, unknown> => value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {}
const text = (value: unknown, fallback: string, max = 260) => typeof value === 'string' && value.trim() ? value.trim().slice(0, max) : fallback
const href = (value: unknown, fallback: string) => typeof value === 'string' && value.startsWith('/') && !value.startsWith('//') && value.length <= 180 ? value : fallback

export function normalizeStartHereContent(value: unknown): StartHereContent {
  const source = object(value)
  const hero = object(source.hero)
  const paths = Array.isArray(source.paths) ? source.paths.map(object) : []
  const closing = object(source.closing)

  return {
    hero: {
      eyebrow: text(hero.eyebrow, defaultStartHereContent.hero.eyebrow, 80),
      title: text(hero.title, defaultStartHereContent.hero.title, 120),
      lead: text(hero.lead, defaultStartHereContent.hero.lead, 300),
    },
    paths: defaultStartHereContent.paths.map((fallback, index) => {
      const row = paths[index] ?? {}
      return { title: text(row.title, fallback.title, 140), text: text(row.text, fallback.text, 300), href: href(row.href, fallback.href), cta: text(row.cta, fallback.cta, 70) }
    }),
    closing: {
      title: text(closing.title, defaultStartHereContent.closing.title, 120),
      lead: text(closing.lead, defaultStartHereContent.closing.lead, 260),
      ctaLabel: text(closing.ctaLabel, defaultStartHereContent.closing.ctaLabel, 70),
      ctaHref: href(closing.ctaHref, defaultStartHereContent.closing.ctaHref),
    },
  }
}
