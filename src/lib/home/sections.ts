export const HOME_SECTION_KINDS = [
  'hero',
  'trust',
  'pathways',
  'guided_start',
  'editorial_feature',
  'offer',
  'articles',
  'testimonials',
  'press',
  'cta',
] as const

export type HomeSectionKind = (typeof HOME_SECTION_KINDS)[number]

export type TrustContent = { items: { title: string; text: string }[] }
export type PathwaysContent = {
  eyebrow: string
  heading: string
  lead: string
  items: { title: string; text: string; href: string; cta: string }[]
}
export type GuidedStartContent = {
  eyebrow: string
  heading: string
  lead: string
  steps: { title: string; text: string; href: string; cta: string }[]
  comparisonEyebrow: string
  comparisonHeading: string
  comparisonLead: string
}
export type EditorialFeatureContent = {
  eyebrow: string
  heading: string
  body: string
  primaryLabel: string
  primaryHref: string
  secondaryLabel: string
  secondaryHref: string
}
export type ArticlesContent = { eyebrow: string; heading: string; lead: string; ctaLabel: string }
export type TestimonialsContent = { eyebrow: string; heading: string }
export type PressContent = { eyebrow: string; heading: string; lead: string; ctaLabel: string }
export type CtaContent = {
  eyebrow: string
  heading: string
  body: string
  primaryLabel: string
  primaryHref: string
  secondaryLabel: string
  secondaryHref: string
}

export type HomeSectionContent =
  | Record<string, never>
  | TrustContent
  | PathwaysContent
  | GuidedStartContent
  | EditorialFeatureContent
  | { ctaLabel: string }
  | ArticlesContent
  | TestimonialsContent
  | PressContent
  | CtaContent

export type HomeSection = {
  id: string
  name: string
  kind: HomeSectionKind
  sort: number
  isVisible: boolean
  content: HomeSectionContent
}

export const HOME_SECTION_OPTIONS: { kind: HomeSectionKind; label: string; name: string }[] = [
  { kind: 'hero', label: 'الواجهة الرئيسية', name: 'الرسالة الرئيسية' },
  { kind: 'trust', label: 'شريط الثقة', name: 'لماذا تثق الزائرة بالمنصة' },
  { kind: 'pathways', label: 'المسارات الأساسية', name: 'الكتب والدورات والجلسات والورش' },
  { kind: 'guided_start', label: 'رحلة البداية', name: 'من السؤال إلى الخطوة' },
  { kind: 'editorial_feature', label: 'المشهد التحريري', name: 'مساحة البداية المصورة' },
  { kind: 'offer', label: 'العرض المنشور', name: 'العرض الحالي' },
  { kind: 'articles', label: 'المقالات المختارة', name: 'أحدث المقالات' },
  { kind: 'testimonials', label: 'الآراء الموثقة', name: 'تجارب معتمدة' },
  { kind: 'press', label: 'الظهور الإعلامي', name: 'مصادر موثقة' },
  { kind: 'cta', label: 'الدعوة الختامية', name: 'الخطوة التالية' },
]

export const DEFAULT_HOME_CONTENT: Record<HomeSectionKind, HomeSectionContent> = {
  hero: {},
  trust: {
    items: [
      { title: 'تجربة عربية', text: 'واجهة ومحتوى باتجاه عربي واضح' },
      { title: 'أربعة مسارات', text: 'كتب ودورات وجلسات وورش عمل' },
      { title: 'تفاصيل قبل القرار', text: 'صفحات مستقلة للمحتوى والمواعيد' },
      { title: 'حساب واحد', text: 'للطلبات والحجوزات والتعلّم' },
    ],
  },
  pathways: {
    eyebrow: 'اختاري الباب الأقرب',
    heading: 'مسارات واضحة في مكان واحد',
    lead: 'ابدئي بالتصفّح، واقرئي التفاصيل المنشورة قبل اتخاذ القرار.',
    items: [
      { title: 'الكتب', text: 'استعرضي الكتب المنشورة وتفاصيلها قبل الشراء.', href: '/books', cta: 'اكتشفي التفاصيل' },
      { title: 'الدورات', text: 'تصفّحي البرامج المتاحة ومحتوى كل مسار وطريقة الوصول إليه.', href: '/courses', cta: 'اكتشفي التفاصيل' },
      { title: 'الجلسات', text: 'اختاري الخدمة ثم اطلعي على المواعيد المتاحة قبل تأكيد الحجز.', href: '/booking', cta: 'اكتشفي التفاصيل' },
      { title: 'ورش العمل', text: 'تابعي الورش المنشورة ومواعيدها وحالة المقاعد من صفحة واحدة.', href: '/workshops', cta: 'اكتشفي التفاصيل' },
    ],
  },
  guided_start: {
    eyebrow: 'رحلة واضحة',
    heading: 'من السؤال إلى خطوة قابلة للتنفيذ',
    lead: 'لا تحتاجين إلى معرفة الطريق كاملًا؛ يكفي أن تختاري الباب الأقرب الآن.',
    steps: [
      { title: 'حددي ما تحتاجينه', text: 'اختبار البداية يساعدك على تسمية المرحلة بدل الاختيار وسط تشتت.', href: '/start-here', cta: 'ابدئي الاختبار' },
      { title: 'اختاري الإيقاع المناسب', text: 'جلسة خاصة، قراءة هادئة، أو مسار تعلم منظم داخل حسابك.', href: '/services', cta: 'قارني المسارات' },
      { title: 'تابعي خطوة بخطوة', text: 'تقدمك وطلباتك وحجوزاتك تبقى مجمعة في مساحة واحدة واضحة.', href: '/dashboard', cta: 'استكشفي لوحتك' },
    ],
    comparisonEyebrow: 'لماذا هذه المنصة؟',
    comparisonHeading: 'تجربة عربية مترابطة، لا محتوى متفرق',
    comparisonLead: 'القيمة ليست في كثرة المواد، بل في وضوح الخطوة وما يمكنك تطبيقه بعدها.',
  },
  editorial_feature: {
    eyebrow: 'مساحة مرتّبة لخطوتك التالية',
    heading: 'ابدئي من السؤال الأقرب، لا من كل الإجابات',
    body: 'حددي ما يشغلك الآن، ثم اختاري بين تعلّم منظم، قراءة عملية، ورشة مباشرة، أو جلسة خاصة.',
    primaryLabel: 'اختبار البداية', primaryHref: '/start-here',
    secondaryLabel: 'قارني المسارات', secondaryHref: '/services',
  },
  offer: { ctaLabel: 'استفيدي من العرض الآن' },
  articles: { eyebrow: 'قراءات منتقاة', heading: 'مقالات تعيد ترتيب الفكرة', lead: 'مساحات قصيرة للتأمل والفهم والتطبيق.', ctaLabel: 'جميع المقالات' },
  testimonials: { eyebrow: 'قالوا عن التجربة', heading: 'شهادات متعلّماتنا' },
  press: { eyebrow: 'ظهور موثّق', heading: 'من المصادر الأصلية', lead: 'حوارات ومواد وروابط منشورة مع توضيح نوع المصدر.', ctaLabel: 'كل المصادر' },
  cta: {
    eyebrow: 'خطوة واحدة تكفي للبداية',
    heading: 'اختاري الباب الأقرب لما تحتاجينه الآن',
    body: 'ابدئي بالمسار الإرشادي القصير، أو قارني الخدمات المنشورة بتفاصيلها الفعلية.',
    primaryLabel: 'ابدئي من هنا', primaryHref: '/start-here',
    secondaryLabel: 'قارني الخدمات', secondaryHref: '/services',
  },
}

const text = (value: unknown, fallback: string, max = 220) => typeof value === 'string' && value.trim() ? value.trim().slice(0, max) : fallback
const href = (value: unknown, fallback: string) => typeof value === 'string' && value.startsWith('/') && !value.startsWith('//') ? value.slice(0, 180) : fallback
const record = (value: unknown): Record<string, unknown> => value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {}
const rows = (value: unknown) => Array.isArray(value) ? value.map(record) : []

export function isHomeSectionKind(value: string): value is HomeSectionKind {
  return HOME_SECTION_KINDS.includes(value as HomeSectionKind)
}

export function defaultHomeContent(kind: HomeSectionKind) {
  return structuredClone(DEFAULT_HOME_CONTENT[kind])
}

export function normalizeHomeContent(kind: HomeSectionKind, value: unknown): HomeSectionContent {
  const source = record(value)
  const fallback = defaultHomeContent(kind)
  if (kind === 'hero') return {}
  if (kind === 'trust') {
    const base = fallback as TrustContent
    const items = rows(source.items).slice(0, 4).map((item, index) => ({
      title: text(item.title, base.items[index]?.title ?? '', 70),
      text: text(item.text, base.items[index]?.text ?? '', 150),
    }))
    return { items: items.length === 4 ? items : base.items }
  }
  if (kind === 'pathways') {
    const base = fallback as PathwaysContent
    const items = rows(source.items).slice(0, 4).map((item, index) => ({
      title: text(item.title, base.items[index]?.title ?? '', 70),
      text: text(item.text, base.items[index]?.text ?? '', 180),
      href: href(item.href, base.items[index]?.href ?? '/services'),
      cta: text(item.cta, base.items[index]?.cta ?? 'اكتشفي التفاصيل', 60),
    }))
    return { eyebrow: text(source.eyebrow, base.eyebrow, 80), heading: text(source.heading, base.heading, 120), lead: text(source.lead, base.lead, 240), items: items.length === 4 ? items : base.items }
  }
  if (kind === 'guided_start') {
    const base = fallback as GuidedStartContent
    const steps = rows(source.steps).slice(0, 3).map((item, index) => ({
      title: text(item.title, base.steps[index]?.title ?? '', 80),
      text: text(item.text, base.steps[index]?.text ?? '', 200),
      href: href(item.href, base.steps[index]?.href ?? '/start-here'),
      cta: text(item.cta, base.steps[index]?.cta ?? 'ابدئي', 60),
    }))
    return {
      eyebrow: text(source.eyebrow, base.eyebrow, 80), heading: text(source.heading, base.heading, 120), lead: text(source.lead, base.lead, 240),
      steps: steps.length === 3 ? steps : base.steps,
      comparisonEyebrow: text(source.comparisonEyebrow, base.comparisonEyebrow, 80),
      comparisonHeading: text(source.comparisonHeading, base.comparisonHeading, 120),
      comparisonLead: text(source.comparisonLead, base.comparisonLead, 240),
    }
  }
  if (kind === 'editorial_feature') {
    const base = fallback as EditorialFeatureContent
    return {
      eyebrow: text(source.eyebrow, base.eyebrow, 80), heading: text(source.heading, base.heading, 120), body: text(source.body, base.body, 320),
      primaryLabel: text(source.primaryLabel, base.primaryLabel, 60), primaryHref: href(source.primaryHref, base.primaryHref),
      secondaryLabel: text(source.secondaryLabel, base.secondaryLabel, 60), secondaryHref: href(source.secondaryHref, base.secondaryHref),
    }
  }
  if (kind === 'offer') return { ctaLabel: text(source.ctaLabel, (fallback as { ctaLabel: string }).ctaLabel, 70) }
  if (kind === 'articles') {
    const base = fallback as ArticlesContent
    return { eyebrow: text(source.eyebrow, base.eyebrow, 80), heading: text(source.heading, base.heading, 120), lead: text(source.lead, base.lead, 240), ctaLabel: text(source.ctaLabel, base.ctaLabel, 70) }
  }
  if (kind === 'testimonials') {
    const base = fallback as TestimonialsContent
    return { eyebrow: text(source.eyebrow, base.eyebrow, 80), heading: text(source.heading, base.heading, 120) }
  }
  if (kind === 'press') {
    const base = fallback as PressContent
    return { eyebrow: text(source.eyebrow, base.eyebrow, 80), heading: text(source.heading, base.heading, 120), lead: text(source.lead, base.lead, 240), ctaLabel: text(source.ctaLabel, base.ctaLabel, 70) }
  }
  const base = fallback as CtaContent
  return {
    eyebrow: text(source.eyebrow, base.eyebrow, 80), heading: text(source.heading, base.heading, 120), body: text(source.body, base.body, 320),
    primaryLabel: text(source.primaryLabel, base.primaryLabel, 60), primaryHref: href(source.primaryHref, base.primaryHref),
    secondaryLabel: text(source.secondaryLabel, base.secondaryLabel, 60), secondaryHref: href(source.secondaryHref, base.secondaryHref),
  }
}

export function defaultHomeSections(): HomeSection[] {
  return HOME_SECTION_OPTIONS.map((item, index) => ({ id: `default-${item.kind}`, name: item.name, kind: item.kind, sort: index * 10, isVisible: true, content: defaultHomeContent(item.kind) }))
}

export function normalizeHomeSections(rowsInput: { id: string; name?: string; kind: string; sort: number; is_visible?: boolean; content: unknown }[], fallbackWhenInvalid = true) {
  const normalized = rowsInput
    .filter((row) => isHomeSectionKind(row.kind) && row.is_visible !== false)
    .map((row) => ({ id: row.id, name: row.name ?? row.kind, kind: row.kind as HomeSectionKind, sort: Number(row.sort), isVisible: row.is_visible !== false, content: normalizeHomeContent(row.kind as HomeSectionKind, row.content) }))
    .sort((a, b) => a.sort - b.sort)
  const required = new Set(normalized.map((section) => section.kind))
  return normalized.length && (!fallbackWhenInvalid || (required.has('hero') && required.has('pathways') && required.has('cta'))) ? normalized : defaultHomeSections()
}
