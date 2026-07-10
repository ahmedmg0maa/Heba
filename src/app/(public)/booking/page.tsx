import type { Metadata } from 'next'
import { listServices, formatPrice, formatDuration, weekdayNames } from '@/lib/data/catalog'
import { PageHero } from '@/components/catalog/PageHero'
import { Section } from '@/components/ui/Section'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

export const metadata: Metadata = {
  title: 'حجز جلسة فردية',
  description: 'احجزي جلسة وضوح فردية ٦٠ دقيقة عبر الفيديو.',
}

export const revalidate = 300

const steps = [
  { title: 'اختاري الجلسة', text: 'راجعي تفاصيل الجلسة ومدتها ومواعيد الإتاحة.' },
  { title: 'أتمّي الدفع', text: 'إنستاباي أو محفظة إلكترونية أو تحويل بنكي، ثم أرفقي إيصالك.' },
  { title: 'استلمي التأكيد', text: 'بعد مراجعة الدفع يصلك رابط الجلسة والموعد على حسابك.' },
]

export default async function BookingPage() {
  const services = await listServices()

  return (
    <main>
      <PageHero
        eyebrow="الجلسات الفردية"
        title="ساعة كاملة، لكِ وحدك"
        lead="مساحة آمنة نفكك فيها التحدي الذي يشغلك — وتخرجين بخطة عملية واضحة لخطوتك التالية."
      />

      <Section eyebrow="كيف يتم الحجز؟" title="ثلاث خطوات بسيطة" tone="white">
        <ol className="grid gap-6 md:grid-cols-3">
          {steps.map((step, i) => (
            <li key={step.title} className="relative rounded-2xl border border-line bg-ivory/60 p-6">
              <span className="tnum mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-deep-teal font-bold text-soft-white">
                {(i + 1).toLocaleString('ar-EG')}
              </span>
              <h3 className="font-bold text-deep-teal">{step.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-text-soft">{step.text}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section eyebrow="الجلسات المتاحة" title="اختاري جلستك">
        <div className="mx-auto max-w-3xl space-y-6">
          {services.map((s) => (
            <Card key={s.slug} hover className="flex flex-col gap-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-deep-teal">{s.title}</h3>
                  <p className="mt-1 text-sm text-antique-gold">{s.subtitle}</p>
                  <p className="mt-3 max-w-xl leading-relaxed text-text-soft">{s.description}</p>
                </div>
                <div className="shrink-0 text-center md:text-end">
                  <p className="tnum text-2xl font-bold text-burgundy">{formatPrice(s.price)}</p>
                  <p className="tnum text-sm text-taupe">{formatDuration(s.durationMinutes)}</p>
                </div>
              </div>

              <div className="rounded-2xl bg-ivory/70 p-5">
                {s.availability.length > 0 && (
                  <>
                    <h4 className="mb-3 text-sm font-bold text-deep-teal">مواعيد الإتاحة الأسبوعية</h4>
                    <ul className="flex flex-wrap gap-3">
                      {s.availability.map((a) => (
                        <li
                          key={`${a.weekday}-${a.startTime}`}
                          className="tnum rounded-full border border-line bg-soft-white px-4 py-1.5 text-sm text-ink"
                        >
                          {weekdayNames[a.weekday]} · {a.startTime.slice(0, 5)}–{a.endTime.slice(0, 5)}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
                <p className={s.availability.length > 0 ? 'mt-3 text-xs text-taupe' : 'text-sm text-text-soft'}>
                  يُحدد الموعد الدقيق معك بعد تأكيد الدفع، بما يناسب جدولك.
                </p>
              </div>

              <Button href={`/checkout/session/${s.slug}`} size="lg" className="self-center md:self-start">
                احجزي الآن وأتمّي الدفع
              </Button>
            </Card>
          ))}
        </div>
      </Section>
    </main>
  )
}
