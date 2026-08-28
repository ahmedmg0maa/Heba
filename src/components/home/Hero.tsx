import Image from 'next/image'
import { Button } from '@/components/ui/Button'
import { SeedMark } from '@/components/layout/SeedMark'
import type { HomeCopy } from '@/lib/data/cms'

const promises = [
  { label: 'مسارات واضحة', note: 'تفاصيل وحدود وأسعار قبل القرار' },
  { label: 'تجربة تحترمك', note: 'اختيارك وخصوصيتك وإيقاعك أولًا' },
  { label: 'خطوات قابلة للتطبيق', note: 'من الفهم إلى ممارسة يومية واقعية' },
]

const marqueeItems = ['جلسات فردية', 'دورات تدريبية', 'كتب رقمية', 'ورش مباشرة', 'برامج متكاملة', 'موارد عملية']

export function Hero({ copy }: { copy: HomeCopy }) {
  return (
    <section className="hero-cinematic relative isolate overflow-hidden border-b border-line bg-surface-raised text-ink dark:border-on-dark/10 dark:bg-[#082730] dark:text-on-dark" aria-labelledby="home-hero-title">
      <span className="hero-glow pointer-events-none absolute -end-48 -top-48 h-[40rem] w-[40rem] rounded-full bg-aqua/18 blur-3xl" aria-hidden />
      <span className="pointer-events-none absolute -start-48 bottom-[-22rem] h-[36rem] w-[36rem] rounded-full bg-antique-gold/22 blur-3xl dark:bg-antique-gold/8" aria-hidden />
      <span className="hero-grid pointer-events-none absolute inset-0 opacity-55 dark:opacity-20" aria-hidden />

      <div className="relative mx-auto grid max-w-[1600px] lg:min-h-[700px] lg:grid-cols-[1fr_1.03fr]">
        <div className="order-1 flex items-center px-5 py-14 sm:px-10 sm:py-18 lg:px-14 lg:py-20 xl:px-24">
          <div className="max-w-[660px] text-center lg:text-start">
            <p className="hero-enter hero-enter-1 inline-flex items-center gap-2 rounded-full border border-aqua/35 bg-aqua/8 px-4 py-2 text-xs font-bold text-aqua-deep backdrop-blur-md dark:bg-on-dark/7 dark:text-aqua sm:text-sm">
              <SeedMark className="h-5 w-auto" />
              {copy.eyebrow}
            </p>

            <h1 id="home-hero-title" className="hero-enter hero-enter-2 mt-7 text-balance font-heading text-[clamp(2.7rem,4.5vw,4.65rem)] leading-[1.16] font-bold tracking-[-.018em] text-deep-teal dark:text-on-dark">
              {copy.headlineStart}{' '}
              <span className="text-aqua-deep dark:text-aqua">{copy.headlineAccent}</span>{' '}
              {copy.headlineMiddle}{' '}
              <span className="text-[#9A7042] dark:text-antique-gold">{copy.headlinePath}</span>{' '}
              {copy.headlineEnd}{' '}
              <span className="text-aqua-deep dark:text-aqua">{copy.headlineAwareness}</span>
            </h1>

            <p className="hero-enter hero-enter-3 mx-auto mt-6 max-w-xl text-base leading-[1.95] text-text-soft sm:text-lg lg:mx-0 dark:text-on-dark/72">
              {copy.lead}
            </p>

            <div className="hero-enter hero-enter-4 mt-8 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
              <Button href="/start-here" size="lg" className="shimmer min-w-52 rounded-full bg-deep-teal font-bold text-on-dark hover:bg-teal-hover dark:bg-aqua dark:text-deep-teal dark:hover:bg-on-dark">{copy.primaryCta}<span aria-hidden>←</span></Button>
              <Button href="/services" size="lg" className="min-w-52 rounded-full border border-deep-teal/22 bg-surface-raised/70 text-deep-teal shadow-none hover:border-aqua hover:bg-aqua/8 dark:border-on-dark/28 dark:bg-on-dark/6 dark:text-on-dark dark:hover:bg-on-dark/12">{copy.secondaryCta}</Button>
            </div>

            <div className="hero-enter hero-enter-5 mt-9 grid gap-3 border-t border-line pt-5 text-start sm:grid-cols-3 dark:border-on-dark/14">
              {promises.map((item) => (
                <div key={item.label} className="min-w-0 border-s border-line ps-3 first:border-s-0 first:ps-0 dark:border-on-dark/12">
                  <p className="text-xs font-bold text-aqua-deep dark:text-aqua sm:text-sm">{item.label}</p>
                  <p className="mt-1 text-[11px] leading-relaxed text-text-soft dark:text-on-dark/55">{item.note}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="order-2 relative min-h-[500px] overflow-hidden border-t border-line lg:min-h-[700px] lg:border-s lg:border-t-0 dark:border-on-dark/10">
          <div className="hero-portrait absolute inset-0">
            <Image
              src="/brand/hero-reader-niqab-v1.jpg"
              alt="امرأة عربية بالغة منقبة في مساحة قراءة هادئة"
              fill
              preload
              fetchPriority="high"
              unoptimized
              sizes="(min-width: 1024px) 51vw, 100vw"
              className="object-cover"
              style={{ objectPosition: '50% 26%' }}
            />
          </div>
          <span className="pointer-events-none absolute inset-0 bg-linear-to-t from-[#0B2B35]/38 via-transparent to-transparent lg:bg-linear-to-l lg:from-surface-raised/45 lg:via-transparent dark:from-[#082730]/64" />
          <span className="pointer-events-none absolute inset-5 rounded-[2rem] border border-on-dark/42 shadow-[inset_0_0_80px_rgb(255_255_255_/_0.08)] lg:inset-8 lg:rounded-[2.75rem]" aria-hidden />
          <div className="absolute bottom-7 end-7 flex items-center gap-3 rounded-full border border-on-dark/38 bg-[#082730]/72 px-4 py-2.5 text-xs font-bold text-on-dark shadow-card backdrop-blur-xl sm:bottom-10 sm:end-10">
            <span className="h-2 w-2 rounded-full bg-aqua shadow-[0_0_0_5px_rgb(92_183_180_/_0.16)]" aria-hidden />
            معرفة هادئة · اختيار واعٍ · تطبيق واقعي
          </div>
        </div>
      </div>

      <div className="relative border-y border-line bg-ivory/88 py-3.5 dark:border-on-dark/10 dark:bg-[#102F39]" aria-label="مسارات المنصة">
        <div className="hero-marquee overflow-hidden" dir="ltr">
          <div className="hero-marquee-track flex min-w-max items-center gap-8 px-4 text-xs font-bold tracking-[.08em] text-text-soft dark:text-on-dark/62 sm:gap-12 sm:text-sm">
            {[...marqueeItems, ...marqueeItems].map((item, index) => (
              <span key={`${item}-${index}`} className="flex items-center gap-8 sm:gap-12" dir="rtl">
                {item}<span className="h-1.5 w-1.5 rotate-45 bg-aqua-deep dark:bg-antique-gold" aria-hidden />
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
