import Image from 'next/image'

const heroVisuals = [
  '/images/experience/editorial-reflection-studio.webp',
  '/images/experience/journey-landscape.webp',
  '/images/experience/course-clarity-journey.webp',
  '/images/experience/book-listen-inward.webp',
  '/brand/catalog-still-life.webp',
]

function selectVisual(eyebrow: string, title: string) {
  const copy = `${eyebrow} ${title}`
  if (/كتب|كتاب|قراءة/.test(copy)) return heroVisuals[3]
  if (/دورات|تعلم|كورس|ورش/.test(copy)) return heroVisuals[2]
  if (/مقال|موارد|بحث|مصادر/.test(copy)) return heroVisuals[4]
  if (/حجز|جلسة|تواصل/.test(copy)) return heroVisuals[0]
  return heroVisuals[1]
}

export function PageHero({
  eyebrow,
  title,
  lead,
  children,
}: {
  eyebrow: string
  title: string
  lead: string
  children?: React.ReactNode
}) {
  const visual = selectVisual(eyebrow, title)
  return (
    <section className="relative isolate overflow-hidden border-b border-line bg-surface-raised dark:border-on-dark/10">
      <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_22%,color-mix(in_srgb,var(--color-aqua)_14%,transparent),transparent_30%),radial-gradient(circle_at_88%_80%,color-mix(in_srgb,var(--color-antique-gold)_18%,transparent),transparent_34%)]" aria-hidden />
      <div className="relative mx-auto grid max-w-[1500px] lg:min-h-[410px] lg:grid-cols-[1fr_.82fr]">
        <div className="flex items-center px-6 py-14 sm:px-10 lg:px-16 lg:py-16 xl:px-24">
          <div className="max-w-2xl text-start">
            <p className="mb-3 flex items-center gap-3 text-xs font-bold tracking-[.18em] text-[#9A7042] dark:text-antique-gold sm:text-sm">
              <span className="h-px w-10 bg-current opacity-55" aria-hidden />
              {eyebrow}
            </p>
            <h1 className="text-balance text-4xl leading-[1.18] font-bold text-deep-teal md:text-5xl">{title}</h1>
            <p className="mt-4 max-w-2xl text-base leading-loose text-text-soft md:text-lg">{lead}</p>
            {children}
          </div>
        </div>
        <div className="group relative min-h-[280px] overflow-hidden border-t border-line lg:min-h-[410px] lg:border-s lg:border-t-0 dark:border-on-dark/10">
          <Image src={visual} alt="" fill unoptimized sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover transition duration-[1400ms] ease-out group-hover:scale-[1.035]" />
          <span className="pointer-events-none absolute inset-0 bg-linear-to-t from-[#082730]/48 via-transparent to-transparent lg:bg-linear-to-l lg:from-surface-raised/52 dark:from-[#071C23]/68" aria-hidden />
          <span className="pointer-events-none absolute inset-5 rounded-[1.75rem] border border-on-dark/38 lg:inset-7 lg:rounded-[2.25rem]" aria-hidden />
        </div>
      </div>
    </section>
  )
}
