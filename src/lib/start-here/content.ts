export const START_HERE_PATHS = ['session', 'course', 'book'] as const
export type StartHerePath = (typeof START_HERE_PATHS)[number]

export type StartHereContent = {
  hero: { eyebrow: string; title: string; lead: string }
  quiz: {
    eyebrow: string
    heading: string
    lead: string
    questions: { title: string; options: Record<StartHerePath, string> }[]
    results: Record<StartHerePath, { title: string; text: string; href: string; cta: string }>
  }
  paths: { title: string; text: string; href: string; cta: string }[]
  closing: { title: string; lead: string; ctaLabel: string; ctaHref: string }
}

export const defaultStartHereContent: StartHereContent = {
  hero: {
    eyebrow: 'ابدئي من هنا',
    title: 'أين أنتِ الآن؟',
    lead: 'اختاري الجملة الأقرب لحالك اليوم لتحصلي على ترشيح إرشادي لمسار عام، وليس توصية شخصية أو علاجية.',
  },
  quiz: {
    eyebrow: 'اختبار اختيار المسار',
    heading: 'ثلاثة أسئلة لترشيح بداية تشبهك',
    lead: 'لا تسجيل ولا نتيجة ثابتة؛ غيّري أي إجابة وشاهدي ترشيحًا إرشاديًا عامًا فورًا.',
    questions: [
      { title: 'ما الأقرب لما تشعرين به الآن؟', options: { session: 'تشتت واحتياج لوضوح', course: 'أريد مسار تعلم منظم', book: 'أحتاج قراءة هادئة وحدي' } },
      { title: 'أي إيقاع يناسبك؟', options: { session: 'جلسة مركزة وشخصية', course: 'خطوات أسبوعية واضحة', book: 'وقت خاص للقراءة' } },
      { title: 'ما الذي تحتاجينه أكثر؟', options: { session: 'تفكيك سؤال شخصي', course: 'فهم نمط متكرر وتطبيق', book: 'تهدئة داخلية وتأمل' } },
    ],
    results: {
      session: { title: 'قد يناسبك استكشاف الجلسات المنشورة', text: 'هذا ترشيح إرشادي عام. تحققي من تفاصيل الخدمة ومواعيدها قبل اتخاذ أي قرار.', href: '/booking', cta: 'استكشفي الجلسات' },
      course: { title: 'قد يناسبك استكشاف الدورات المنشورة', text: 'يعرض الكتالوج وصف كل دورة ومنهجها الفعلي عند نشره.', href: '/courses', cta: 'استكشفي الدورات' },
      book: { title: 'قد يناسبك استكشاف الكتب المنشورة', text: 'يعرض الكتالوج تفاصيل كل كتاب وطريقة الوصول المنشورة له.', href: '/books', cta: 'تصفحي الكتب' },
    },
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
  const quiz = object(source.quiz)
  const questions = Array.isArray(quiz.questions) ? quiz.questions.map(object) : []
  const results = object(quiz.results)
  const paths = Array.isArray(source.paths) ? source.paths.map(object) : []
  const closing = object(source.closing)

  return {
    hero: {
      eyebrow: text(hero.eyebrow, defaultStartHereContent.hero.eyebrow, 80),
      title: text(hero.title, defaultStartHereContent.hero.title, 120),
      lead: text(hero.lead, defaultStartHereContent.hero.lead, 300),
    },
    quiz: {
      eyebrow: text(quiz.eyebrow, defaultStartHereContent.quiz.eyebrow, 80),
      heading: text(quiz.heading, defaultStartHereContent.quiz.heading, 120),
      lead: text(quiz.lead, defaultStartHereContent.quiz.lead, 260),
      questions: defaultStartHereContent.quiz.questions.map((fallback, index) => {
        const row = questions[index] ?? {}
        const options = object(row.options)
        return { title: text(row.title, fallback.title, 120), options: {
          session: text(options.session, fallback.options.session, 100),
          course: text(options.course, fallback.options.course, 100),
          book: text(options.book, fallback.options.book, 100),
        } }
      }),
      results: Object.fromEntries(START_HERE_PATHS.map((path) => {
        const fallback = defaultStartHereContent.quiz.results[path]
        const row = object(results[path])
        return [path, { title: text(row.title, fallback.title, 140), text: text(row.text, fallback.text, 300), href: href(row.href, fallback.href), cta: text(row.cta, fallback.cta, 70) }]
      })) as StartHereContent['quiz']['results'],
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

