import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { SeedMark } from '@/components/layout/SeedMark'
import type { HomeCopy } from '@/lib/data/cms'

const promises = [
  { label: 'فهم أهدأ', note: 'محتوى يوضّح ولا يضغط' },
  { label: 'اختيار أوعى', note: 'مسارات وحدود وأسعار واضحة' },
  { label: 'خطوة تشبهك', note: 'ابدئي بالإيقاع المناسب لكِ' },
]

export function Hero({ copy }: { copy: HomeCopy }) {
  return (
    <section className="hero-stage heritage-paper relative isolate overflow-hidden border-b border-antique-gold/25 bg-ivory" aria-labelledby="home-hero-title">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,color-mix(in_srgb,var(--color-aqua)_12%,transparent),transparent_34%),radial-gradient(circle_at_8%_82%,color-mix(in_srgb,var(--color-antique-gold)_18%,transparent),transparent_30%)]" />
      <span className="hero-orbit pointer-events-none absolute -start-40 top-8 h-[34rem] w-[34rem] rounded-full border border-antique-gold/25" aria-hidden />
      <span className="hero-orbit hero-orbit-small pointer-events-none absolute end-[38%] top-16 hidden h-32 w-32 rounded-full border border-aqua/25 lg:block" aria-hidden />

      <div className="relative mx-auto grid max-w-[1440px] lg:min-h-[700px] lg:grid-cols-[1.03fr_.97fr]">
        <div className="order-1 flex items-center px-5 pb-8 pt-10 sm:px-10 sm:py-16 lg:px-12 lg:py-20 xl:px-20">
          <div className="mx-auto max-w-2xl text-center lg:mx-0 lg:text-start">
            <p className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-antique-gold/35 bg-surface-raised/80 px-4 py-2 text-xs font-bold text-deep-teal shadow-sm backdrop-blur-sm sm:text-sm">
              <SeedMark className="h-5 w-auto" />
              {copy.eyebrow}
            </p>

            <h1 id="home-hero-title" className="animate-fade-up delay-1 mt-7 font-heading text-[clamp(3.35rem,6.5vw,6.25rem)] leading-[.98] font-bold tracking-[-.025em] text-ink">
              <span className="block">{copy.headlineStart} <span className="relative text-deep-teal">{copy.headlineAccent}<span className="absolute inset-x-0 -bottom-1 h-2 rounded-full bg-aqua/18" aria-hidden /></span></span>
              <span className="mt-2 block text-burgundy">{copy.headlineMiddle} <span className="text-antique-gold">{copy.headlinePath}</span></span>
              <span className="mt-2 block">{copy.headlineEnd} <span className="text-deep-teal">{copy.headlineAwareness}</span></span>
            </h1>

            <p className="animate-fade-up delay-2 mx-auto mt-7 max-w-xl text-base leading-[2] text-text-soft sm:text-lg lg:mx-0">
              {copy.lead}
            </p>

            <div className="animate-fade-up delay-3 mt-8 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
              <Button href="/start-here" size="lg" className="shimmer min-w-52 rounded-full">{copy.primaryCta}<span aria-hidden>←</span></Button>
              <Button href="/services" variant="secondary" size="lg" className="min-w-52 rounded-full bg-surface-raised/65">{copy.secondaryCta}</Button>
            </div>

            <div className="mt-9 grid grid-cols-3 gap-2 border-t border-antique-gold/30 pt-5 text-start">
              {promises.map((item) => (
                <div key={item.label} className="min-w-0">
                  <p className="text-xs font-bold text-deep-teal sm:text-sm">{item.label}</p>
                  <p className="mt-1 hidden text-[11px] leading-relaxed text-text-soft sm:block">{item.note}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <figure className="order-2 relative min-h-[500px] px-5 pb-8 sm:min-h-[650px] sm:px-10 lg:min-h-[700px] lg:px-0 lg:pb-0">
          <div className="absolute inset-y-0 end-0 hidden w-[78%] bg-deep-teal lg:block" aria-hidden />
          <div className="relative mx-auto h-full min-h-[500px] max-w-[620px] overflow-hidden rounded-[2.25rem] border border-antique-gold/35 bg-sand/25 shadow-[0_30px_90px_rgb(38_56_61_/_0.2)] sm:min-h-[620px] lg:absolute lg:inset-y-8 lg:end-8 lg:start-0 lg:max-w-none lg:rounded-e-none lg:rounded-s-[4.5rem] xl:end-12">
            <Image
              src="/brand/hero-reader-niqab-v1.jpg"
              alt="امرأة عربية بالغة منقبة تقرأ في مكتبة هادئة — صورة تعبيرية لجمهور المنصة"
              fill
              preload
              fetchPriority="high"
              unoptimized
              sizes="(min-width: 1024px) 48vw, 100vw"
              className="object-cover"
              style={{ objectPosition: '50% 26%' }}
            />
            <span className="pointer-events-none absolute inset-0 bg-linear-to-t from-deep-teal/55 via-transparent to-ivory/5" />
            <figcaption className="absolute bottom-5 end-5 rounded-full border border-on-dark/20 bg-deep-teal/78 px-3 py-1.5 text-[11px] font-medium text-on-dark backdrop-blur-md">
              صورة تعبيرية
            </figcaption>
          </div>

          <div className="absolute bottom-12 start-2 max-w-[240px] rounded-3xl border border-antique-gold/35 bg-surface-raised/92 p-5 text-start shadow-card backdrop-blur-md sm:start-6 lg:bottom-20 lg:start-0">
            <p className="font-heading text-xl font-bold text-deep-teal">لستِ مطالبة بمعرفة كل الإجابات</p>
            <p className="mt-2 text-xs leading-relaxed text-text-soft">ابدئي بسؤال واحد، وسنساعدك على رؤية المسارات المتاحة بوضوح.</p>
            <Link href="/start-here" className="mt-3 inline-flex items-center gap-2 text-xs font-bold text-burgundy">اكتشفي نقطة البداية <span aria-hidden>←</span></Link>
          </div>
        </figure>
      </div>
    </section>
  )
}
