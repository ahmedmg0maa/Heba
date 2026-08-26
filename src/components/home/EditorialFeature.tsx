import Image from 'next/image'
import { Button } from '@/components/ui/Button'
import { BotanicalSpray } from '@/components/layout/BotanicalSpray'

export function EditorialFeature() {
  return (
    <section className="px-4 py-8 sm:px-6 sm:py-12">
      <div className="relative mx-auto grid max-w-7xl overflow-hidden rounded-3xl border border-antique-gold/30 bg-deep-teal shadow-card lg:grid-cols-[1.15fr_.85fr]">
        <div className="relative min-h-72 lg:min-h-[430px]">
          <Image
            src="/brand/catalog-still-life.webp"
            alt="كتب ودفتر ومساحة تعلم هادئة بألوان هوية هبة الشريف"
            fill
            sizes="(min-width: 1024px) 58vw, 100vw"
            className="object-cover"
            style={{ objectPosition: '55% center' }}
          />
          <span className="absolute inset-0 bg-linear-to-t from-deep-teal/45 via-transparent to-transparent lg:bg-linear-to-l" />
        </div>
        <div className="relative flex flex-col justify-center px-6 py-10 text-on-dark sm:px-10 lg:px-12">
          <BotanicalSpray mirrored className="pointer-events-none absolute -bottom-24 -end-20 h-72 text-muted-gold opacity-15" />
          <p className="text-xs font-bold tracking-[.18em] text-antique-gold">مساحة مرتّبة لخطوتك التالية</p>
          <h2 className="relative mt-4 text-3xl leading-snug font-bold sm:text-4xl">ابدئي من السؤال الأقرب، لا من كل الإجابات</h2>
          <p className="relative mt-4 leading-loose text-on-dark/72">
            حددي ما يشغلك الآن، ثم اختاري بين تعلّم منظم، قراءة عملية، ورشة مباشرة، أو جلسة خاصة.
          </p>
          <div className="relative mt-7 flex flex-wrap gap-3">
            <Button href="/start-here" className="bg-antique-gold text-deep-teal hover:bg-muted-gold">اختبار البداية</Button>
            <Button href="/services" variant="secondary" className="border-on-dark/30 text-on-dark hover:bg-on-dark/10">قارني المسارات</Button>
          </div>
        </div>
      </div>
    </section>
  )
}
