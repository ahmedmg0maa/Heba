import type { Metadata } from 'next'
import { listServices, formatPrice, formatDuration, weekdayNames } from '@/lib/data/catalog'
import { PageHero } from '@/components/catalog/PageHero'
import { ServiceCards } from '@/components/home/ServiceCards'
import { CTARibbon } from '@/components/catalog/CTARibbon'
import { Section } from '@/components/ui/Section'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { getServerClient } from '@/lib/supabase/server'
import { hasSupabasePublicConfig } from '@/lib/supabase/public-key'

export const metadata: Metadata = {
  title: 'الخدمات',
  description: 'دورات، كتب، ورش عمل، وجلسات فردية — اختاري الشكل الأنسب لرحلتك.',
}

export const revalidate = 300

export default async function ServicesPage() {
  const services = await listServices()
  const plans = await listPublishedPlans()

  return (
    <main>
      <PageHero
        eyebrow="خدماتنا"
        title="مسارات مختلفة، وجهة واحدة"
        lead="استكشفي المسارات المنشورة واقرئي تفاصيل كل تجربة قبل اختيار خطوتك التالية."
      />
      <ServiceCards />

      <Section tone="white" eyebrow="المرافقة الفردية" title="الجلسات الفردية">
        <div className="mx-auto max-w-3xl space-y-6">
          {services.length === 0 ? <EmptyState
            title="لا توجد جلسات منشورة حاليًا"
            description="ستظهر الجلسات الفردية هنا عند تفعيلها مع مواعيدها من إدارة المنصة."
            actionLabel="ابدئي من هنا"
            actionHref="/start-here"
          /> : services.map((s) => (
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

      {plans && plans.length > 0 && <Section eyebrow="مرافقة مستمرة" title="باقات تناسب إيقاعك" lead="اختاري مدة واضحة ومزايا محددة؛ لا التزامات مخفية ولا تفاصيل مبهمة.">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">{plans.map((plan) => {
          const features = Array.isArray(plan.features) ? plan.features.map(String) : []
          const interval = plan.billing_interval === 'month' ? 'شهريًا' : plan.billing_interval === 'quarter' ? 'كل 3 أشهر' : plan.billing_interval === 'year' ? 'سنويًا' : 'مرة واحدة'
          return <Card key={plan.id} className="relative flex flex-col overflow-hidden border-antique-gold/30 p-7"><span className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-transparent via-antique-gold to-transparent"/><p className="text-xs font-bold text-antique-gold">{interval}</p><h3 className="mt-2 text-2xl font-bold text-deep-teal">{plan.title}</h3><p className="mt-3 flex items-end gap-2"><strong className="tnum text-3xl text-burgundy">{Number(plan.price).toLocaleString('ar-EG')}</strong><span className="text-sm text-text-soft">{plan.currency}</span></p><p className="mt-4 leading-loose text-text-soft">{plan.description}</p><ul className="mt-5 flex-1 space-y-2 text-sm text-ink">{features.map((feature) => <li key={feature} className="flex gap-2"><span className="text-antique-gold">✓</span>{feature}</li>)}{plan.sessions_included > 0 && <li className="flex gap-2"><span className="text-antique-gold">✓</span>{plan.sessions_included.toLocaleString('ar-EG')} جلسات مشمولة</li>}</ul><Button href="/contact" className="mt-6">اطلبي الاشتراك</Button></Card>
        })}</div>
      </Section>}

      <CTARibbon />
    </main>
  )
}

async function listPublishedPlans() {
  if (!hasSupabasePublicConfig()) return []

  try {
    const supabase = await getServerClient()
    const { data, error } = await supabase
      .from('subscription_plans')
      .select('id, title, description, price, currency, billing_interval, duration_days, sessions_included, max_subscribers, features')
      .eq('is_published', true)
      .eq('is_active', true)
      .order('sort', { ascending: true })

    return error ? [] : data ?? []
  } catch {
    return []
  }
}
