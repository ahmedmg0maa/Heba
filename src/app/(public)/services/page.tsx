import type { Metadata } from 'next'
import { listServices, formatPrice, formatDuration, weekdayNames } from '@/lib/data/catalog'
import { PageHero } from '@/components/catalog/PageHero'
import { ServiceCards } from '@/components/home/ServiceCards'
import { CTARibbon } from '@/components/catalog/CTARibbon'
import { Section } from '@/components/ui/Section'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

export const metadata: Metadata = {
  title: 'الخدمات',
  description: 'دورات، كتب، ورش عمل، وجلسات فردية — اختاري الشكل الأنسب لرحلتك.',
}

export const revalidate = 300

export default async function ServicesPage() {
  const services = await listServices()

  return (
    <main>
      <PageHero
        eyebrow="خدماتنا"
        title="مسارات مختلفة، وجهة واحدة"
        lead="سواء فضّلتِ التعلم الذاتي بالكتب، أو المرافقة المعمقة بالدورات، أو اللقاء المباشر — هنا ما يناسبك."
      />
      <ServiceCards />

      <Section tone="white" eyebrow="المرافقة الفردية" title="الجلسات الفردية">
        <div className="mx-auto max-w-3xl space-y-6">
          {services.map((s) => (
            <Card key={s.slug} className="flex flex-col gap-6 md:flex-row md:items-center">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-deep-teal">{s.title}</h3>
                <p className="mt-1 text-sm text-antique-gold">{s.subtitle}</p>
                <p className="mt-2 text-sm leading-relaxed text-text-soft">{s.description}</p>
                <ul className="tnum mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-taupe">
                  <li>{formatDuration(s.durationMinutes)}</li>
                  {s.availability.map((a) => (
                    <li key={`${a.weekday}-${a.startTime}`}>{weekdayNames[a.weekday]}</li>
                  ))}
                </ul>
              </div>
              <div className="flex shrink-0 flex-col items-center gap-3">
                <span className="tnum text-xl font-bold text-burgundy">{formatPrice(s.price)}</span>
                <Button href="/booking" size="sm">
                  احجزي موعدك
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </Section>

      <CTARibbon />
    </main>
  )
}
