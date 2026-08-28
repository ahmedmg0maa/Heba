import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { SeedMark } from '@/components/layout/SeedMark'
import type { HomeCopy } from '@/lib/data/cms'

const promises = [
  { label: 'فهم أهدأ', note: 'محتوى يوضّح ولا يضغط' },
  { label: 'اختيار أوعى', note: 'تفاصيل وحدود واضحة' },
  { label: 'خطوة تشبهك', note: 'بإيقاع يناسب حياتك' },
]

const marqueeItems = ['جلسات فردية', 'دورات تدريبية', 'كتب رقمية', 'ورش مباشرة', 'برامج متكاملة', 'موارد عملية']

export function Hero({ copy }: { copy: HomeCopy }) {
  return (
    <section className="hero-cinematic relative isolate overflow-hidden bg-[#0B2B35] text-on-dark" aria-labelledby="home-hero-title">
      <div className="hero-glow pointer-events-none absolute -end-48 -top-48 h-[42rem] w-[42rem] rounded-full bg-aqua/13 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute inset-0 opacity-25 [background-image:linear-gradient(rgb(255_255_255_/_0.035)_1px,transparent_1px),linear-gradient(90deg,rgb(255_255_255_/_0.035)_1px,transparent_1px)] [background-size:72px_72px]" aria-hidden />
      <div className="pointer-events-none absolute inset-y-0 start-[8%] hidden w-px bg-linear-to-b from-transparent via-antique-gold/35 to-transparent lg:block" aria-hidden />

      <div className="relative mx-auto grid max-w-[1600px] lg:min-h-[710px] lg:grid-cols-[1.02fr_.98fr]">
        <div className="order-1 flex items-center px-5 py-12 sm:px-10 sm:py-16 lg:px-14 lg:pb-28 lg:pt-20 xl:px-24">
          <div className="max-w-[650px] text-center lg:text-start">
            <p className="hero-enter hero-enter-1 inline-flex items-center gap-2 rounded-full border border-aqua/28 bg-on-dark/7 px-4 py-2 text-xs font-bold text-aqua backdrop-blur-md sm:text-sm">
              <SeedMark className="h-5 w-auto" />
              {copy.eyebrow}
            </p>

            <h1 id="home-hero-title" className="hero-enter hero-enter-2 mt-7 font-heading text-[clamp(3.3rem,5.8vw,5.8rem)] leading-[1.12] font-bold tracking-[-.02em] text-on-dark">
              <span className="block">{copy.headlineStart} <span className="text-aqua">{copy.headlineAccent}</span></span>
              <span className="mt-1 block">{copy.headlineMiddle} <span className="text-antique-gold">{copy.headlinePath}</span></span>
              <span className="mt-1 block">{copy.headlineEnd} <span className="text-aqua">{copy.headlineAwareness}</span></span>
            </h1>

            <p className="hero-enter hero-enter-3 mx-auto mt-7 max-w-xl text-base leading-[2] text-on-dark/68 sm:text-lg lg:mx-0">
              {copy.lead}
            </p>

            <div className="hero-enter hero-enter-4 mt-8 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
              <Button href="/start-here" size="lg" className="shimmer min-w-52 rounded-full bg-aqua font-bold text-deep-teal hover:bg-on-dark">{copy.primaryCta}<span aria-hidden>←</span></Button>
              <Button href="/services" size="lg" className="min-w-52 rounded-full border border-on-dark/28 bg-on-dark/6 text-on-dark shadow-none hover:border-aqua hover:bg-on-dark/12">{copy.secondaryCta}</Button>
            </div>

            <div className="hero-enter hero-enter-5 mt-9 grid grid-cols-3 gap-3 border-t border-on-dark/14 pt-5 text-start">
              {promises.map((item) => (
                <div key={item.label} className="min-w-0 border-s border-on-dark/10 ps-3 first:border-s-0 first:ps-0">
                  <p className="text-xs font-bold text-aqua sm:text-sm">{item.label}</p>
                  <p className="mt-1 hidden text-[11px] leading-relaxed text-on-dark/52 sm:block">{item.note}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <figure className="order-2 relative min-h-[520px] overflow-hidden border-t border-on-dark/10 lg:min-h-[710px] lg:border-s lg:border-t-0">
          <div className="hero-portrait absolute inset-0">
            <Image
              src="/brand/hero-reader-niqab-v1.jpg"
              alt="امرأة عربية بالغة منقبة تقرأ في مكتبة هادئة — صورة تعبيرية لجمهور المنصة"
              fill
              preload
              fetchPriority="high"
              unoptimized
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
              style={{ objectPosition: '50% 26%' }}
            />
          </div>
          <span className="pointer-events-none absolute inset-0 bg-linear-to-t from-[#0B2B35]/80 via-transparent to-transparent lg:bg-linear-to-l lg:from-[#0B2B35]/60 lg:via-transparent" />
          <span className="pointer-events-none absolute inset-5 rounded-[2.25rem] border border-on-dark/14 lg:inset-8 lg:rounded-[3rem]" aria-hidden />

          <div className="hero-float-card absolute bottom-8 start-5 max-w-[270px] rounded-3xl border border-on-dark/18 bg-[#0B2B35]/78 p-5 text-start shadow-[0_18px_70px_rgb(0_0_0_/_0.28)] backdrop-blur-xl sm:bottom-10 sm:start-9">
            <p className="font-heading text-xl font-bold text-on-dark">لستِ مطالبة بمعرفة كل الإجابات</p>
            <p className="mt-2 text-xs leading-relaxed text-on-dark/62">ابدئي بسؤال واحد، ثم قارني المسارات المتاحة بوضوح.</p>
            <Link href="/start-here" className="mt-3 inline-flex items-center gap-2 text-xs font-bold text-aqua">اكتشفي نقطة البداية <span aria-hidden>←</span></Link>
          </div>
          <figcaption className="absolute end-6 top-6 rounded-full border border-on-dark/16 bg-[#0B2B35]/68 px-3 py-1.5 text-[10px] font-medium text-on-dark/72 backdrop-blur-md sm:end-9 sm:top-9">
            صورة تعبيرية
          </figcaption>
        </figure>
      </div>

      <div className="relative border-y border-on-dark/10 bg-[#102F39] py-3.5" aria-label="مسارات المنصة">
        <div className="hero-marquee overflow-hidden" dir="ltr">
          <div className="hero-marquee-track flex min-w-max items-center gap-8 px-4 text-xs font-bold tracking-[.08em] text-on-dark/58 sm:gap-12 sm:text-sm">
            {[...marqueeItems, ...marqueeItems].map((item, index) => (
              <span key={`${item}-${index}`} className="flex items-center gap-8 sm:gap-12" dir="rtl">
                {item}<span className="h-1.5 w-1.5 rotate-45 bg-antique-gold" aria-hidden />
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
