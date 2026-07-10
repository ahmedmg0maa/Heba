import { Button } from '@/components/ui/Button'
import { FloralOrnament, PortraitFrame } from './FloralOrnament'

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-ivory">
      <FloralOrnament className="pointer-events-none absolute end-0 top-8 hidden h-80 opacity-70 lg:block" />
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-16 md:py-24 lg:grid-cols-2">
        {/* Text — inline start (right in RTL) */}
        <div className="relative z-10">
          <p className="mb-4 flex items-center gap-3 text-sm font-semibold tracking-widest text-antique-gold">
            <span className="h-px w-12 bg-antique-gold" aria-hidden />
            مساحتك للنمو الواعي
          </p>
          <h1 className="text-4xl leading-snug font-bold text-ink md:text-5xl lg:text-[3.4rem] lg:leading-[1.35]">
            عيشي حياةً <span className="text-burgundy">أهدأ</span>،
            <br />
            وابني ذاتًا <span className="text-deep-teal">أقوى</span> يومًا بعد يوم
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-loose text-text-soft">
            دورات تدريبية، كتب رقمية، ورش عمل مباشرة، وجلسات فردية — صُمّمت
            بعناية لترافقك في رحلة تطوّر هادئة تشبهك.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Button href="/courses" size="lg">
              استكشفي الدورات
            </Button>
            <Button href="/start-here" variant="secondary" size="lg">
              ابدئي من هنا
            </Button>
          </div>
          <ul className="mt-12 flex flex-wrap gap-x-8 gap-y-3">
            {['جلسات فردية ١:١', 'ورش عمل مباشرة', 'كتب ودورات رقمية'].map((label) => (
              <li key={label} className="flex items-center gap-2 text-sm font-semibold text-deep-teal">
                <span className="h-1.5 w-1.5 rounded-full bg-antique-gold" aria-hidden />
                {label}
              </li>
            ))}
          </ul>
        </div>

        {/* Portrait — inline end (left in RTL) */}
        <div className="relative mx-auto w-full max-w-sm lg:max-w-md">
          <PortraitFrame />
        </div>
      </div>
    </section>
  )
}
