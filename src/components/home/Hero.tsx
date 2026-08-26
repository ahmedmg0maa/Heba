import Image from 'next/image'
import { Button } from '@/components/ui/Button'
import { SeedMark } from '@/components/layout/SeedMark'
import type { HomeCopy } from '@/lib/data/cms'

export function Hero({ copy }: { copy: HomeCopy }) {
  return (
    <section className="heritage-paper relative isolate overflow-hidden border-b border-line bg-ivory" aria-labelledby="home-hero-title">
      <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-antique-gold/50 to-transparent" />
      <span className="pointer-events-none absolute end-[31%] top-12 hidden h-28 w-28 rounded-full border border-antique-gold/20 lg:block" />

      <div dir="ltr" className="relative mx-auto grid max-w-[1600px] lg:min-h-[610px] lg:grid-cols-[.76fr_1.18fr_.9fr]">
        <aside className="relative hidden min-h-[610px] overflow-hidden border-e border-antique-gold/25 lg:col-start-1 lg:row-start-1 lg:block" aria-hidden>
          <Image
            src="/brand/catalog-still-life.webp"
            alt=""
            fill
            sizes="24vw"
            className="object-cover"
            style={{ objectPosition: '27% center' }}
          />
          <span className="absolute inset-0 bg-ivory/44" />
          <span className="absolute inset-0 bg-linear-to-r from-ivory/5 via-ivory/20 to-ivory/88" />
          <span className="absolute bottom-10 start-9 h-28 w-20 border-b border-s border-antique-gold/35" />
        </aside>

        <div dir="rtl" className="order-1 flex items-center px-5 py-9 sm:px-10 sm:py-16 lg:col-start-2 lg:row-start-1 lg:px-10 xl:px-14">
          <div className="mx-auto max-w-[660px] text-center">
            <p className="animate-fade-up mb-5 flex items-center justify-center gap-3 text-xs font-semibold tracking-[.13em] text-antique-gold sm:text-sm">
              <span className="h-px w-9 bg-current opacity-60" aria-hidden />
              <SeedMark className="h-6 w-auto" />
              {copy.eyebrow}
              <span className="h-px w-9 bg-current opacity-60" aria-hidden />
            </p>
            <h1 id="home-hero-title" className="animate-fade-up delay-1 font-heading text-[clamp(3rem,5vw,5.45rem)] leading-[1.12] font-bold text-ink">
              {copy.headlineStart} <span className="text-burgundy">{copy.headlineAccent}</span>
              <br />
              {copy.headlineMiddle} <span className="text-deep-teal">{copy.headlinePath}</span>
              <br />
              {copy.headlineEnd} <span className="text-antique-gold">{copy.headlineAwareness}</span>
            </h1>
            <p className="animate-fade-up delay-2 mx-auto mt-6 max-w-xl text-base leading-[2] text-text-soft sm:text-lg">
              {copy.lead}
            </p>
            <div className="animate-fade-up delay-3 mt-7 grid grid-cols-2 gap-3 sm:mt-8">
              <Button href="/start-here" size="lg" className="min-w-48 rounded-lg">{copy.primaryCta}</Button>
              <Button href="/services" variant="secondary" size="lg" className="min-w-48 rounded-lg">{copy.secondaryCta}</Button>
            </div>
            <p className="mt-6 text-xs leading-relaxed text-taupe">تصفّحي التفاصيل المتاحة واختاري ما يناسبك دون افتراض مسار مسبق.</p>
          </div>
        </div>

        <figure className="order-2 px-5 pb-9 sm:px-10 sm:pb-12 lg:col-start-3 lg:row-start-1 lg:flex lg:items-end lg:border-s lg:border-antique-gold/25 lg:px-5 lg:pb-0 lg:pt-8">
          <div className="relative mx-auto aspect-[4/5] w-full max-w-[470px] overflow-hidden rounded-t-[8.5rem] rounded-b-2xl border border-antique-gold/35 bg-sand/25 shadow-[0_22px_60px_rgb(38_56_61_/_0.12)] lg:h-[570px] lg:max-w-none lg:rounded-t-[11rem] lg:rounded-b-none">
            <Image
              src="/brand/hero-reader-niqab-v1.jpg"
              alt="امرأة عربية بالغة منقبة تقرأ في مكتبة هادئة — صورة تعبيرية لجمهور المنصة"
              fill
              preload
              fetchPriority="high"
              unoptimized
              sizes="(min-width: 1024px) 29vw, (min-width: 640px) 70vw, 100vw"
              className="object-cover"
              style={{ objectPosition: '50% 29%' }}
            />
            <span className="pointer-events-none absolute inset-0 bg-linear-to-t from-deep-teal/20 via-transparent to-transparent" />
            <figcaption className="absolute bottom-4 start-4 rounded-full border border-on-dark/20 bg-deep-teal/78 px-3 py-1.5 text-[11px] font-medium text-on-dark backdrop-blur-sm">
              صورة تعبيرية
            </figcaption>
          </div>
        </figure>
      </div>
    </section>
  )
}
