import type { Metadata } from 'next'
import { listWorkshops, formatPrice } from '@/lib/data/catalog'
import { PageHero } from '@/components/catalog/PageHero'
import { CTARibbon } from '@/components/catalog/CTARibbon'
import { Section } from '@/components/ui/Section'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'

export const metadata: Metadata = {
  title: 'ورش العمل',
  description: 'لقاءات تفاعلية مباشرة أونلاين بمقاعد محدودة وتطبيق فوري.',
}

export const revalidate = 120

const dateFmt = new Intl.DateTimeFormat('ar-EG', { weekday: 'long', day: 'numeric', month: 'long' })
const timeFmt = new Intl.DateTimeFormat('ar-EG', { hour: 'numeric', minute: '2-digit' })

export default async function WorkshopsPage() {
  const workshops = await listWorkshops()

  return (
    <main>
      <PageHero
        eyebrow="ورش العمل المباشرة"
        title="نلتقي، نتمرّن، نخرج بنتيجة"
        lead="ورش تفاعلية مباشرة بمقاعد محدودة — تمارين جماعية وتطبيق فوري وتسجيل يبقى معك."
      />

      <Section eyebrow="الجدول القادم" title="الورش المتاحة">
        {workshops.length === 0 ? (
          <EmptyState
            title="لا توجد ورش معلنة حاليًا"
            description="نجهّز الآن لورشة جديدة. اشتركي في الرسالة الأسبوعية ليصلك موعدها أولًا."
            actionLabel="عودي للرئيسية"
            actionHref="/"
          />
        ) : (
          <div className="mx-auto max-w-3xl space-y-6">
            {workshops.map((w) => {
              const starts = new Date(w.startsAt)
              const seatsLeft = w.seatsTotal - w.seatsReserved
              return (
                <Card key={w.slug} hover as="article" className="flex flex-col gap-6 md:flex-row md:items-center">
                  <div className="flex h-24 w-24 shrink-0 flex-col items-center justify-center rounded-2xl bg-deep-teal text-soft-white">
                    <span className="tnum text-3xl font-bold">{starts.toLocaleDateString('ar-EG', { day: 'numeric' })}</span>
                    <span className="text-sm text-muted-gold">{starts.toLocaleDateString('ar-EG', { month: 'long' })}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-xl font-bold text-deep-teal">{w.title}</h3>
                      {seatsLeft > 0 && seatsLeft <= 15 && (
                        <Badge tone="burgundy">{`باقٍ ${seatsLeft.toLocaleString('ar-EG')} مقعدًا`}</Badge>
                      )}
                      {seatsLeft <= 0 && <Badge tone="sand">اكتمل العدد</Badge>}
                    </div>
                    <p className="mt-1 text-sm text-antique-gold">{w.subtitle}</p>
                    <p className="mt-2 text-sm leading-relaxed text-text-soft">{w.description}</p>
                    <p className="tnum mt-3 text-sm text-taupe">
                      {dateFmt.format(starts)} · {timeFmt.format(starts)} · {w.locationKind === 'online' ? 'أونلاين مباشر' : 'حضوري'}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-center gap-3">
                    <p className="flex items-baseline gap-2">
                      <span className="tnum text-xl font-bold text-burgundy">{formatPrice(w.price)}</span>
                      {w.compareAtPrice && (
                        <span className="tnum text-sm text-taupe line-through">{formatPrice(w.compareAtPrice)}</span>
                      )}
                    </p>
                    <Button href={`/workshops/${w.slug}`} size="sm">
                      التفاصيل والحجز
                    </Button>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </Section>

      <CTARibbon
        title="فاتتك الورشة؟"
        lead="دوراتنا المسجلة متاحة دائمًا بوصول مدى الحياة."
        ctaLabel="تصفّحي الدورات"
        ctaHref="/courses"
      />
    </main>
  )
}
