import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getWorkshop, formatPrice } from '@/lib/data/catalog'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Countdown } from '@/components/ui/Countdown'
import { CTARibbon } from '@/components/catalog/CTARibbon'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const w = await getWorkshop((await params).slug)
  return w ? { title: w.title, description: w.description } : { title: 'ورشة غير موجودة' }
}

export const revalidate = 120

const dateFmt = new Intl.DateTimeFormat('ar-EG', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
const timeFmt = new Intl.DateTimeFormat('ar-EG', { hour: 'numeric', minute: '2-digit' })

export default async function WorkshopDetailPage({ params }: Props) {
  const w = await getWorkshop((await params).slug)
  if (!w) notFound()

  const starts = new Date(w.startsAt)
  const ends = new Date(w.endsAt)
  const seatsLeft = w.seatsTotal - w.seatsReserved
  const soldOut = seatsLeft <= 0

  return (
    <main>
      <section className="border-b border-line bg-soft-white">
        <div className="mx-auto grid max-w-6xl items-start gap-10 px-6 py-14 lg:grid-cols-[1.5fr_1fr]">
          <div>
            <p className="mb-2 text-sm font-semibold tracking-widest text-antique-gold">{w.subtitle}</p>
            <h1 className="text-4xl font-bold text-deep-teal">{w.title}</h1>
            <p className="mt-5 max-w-2xl text-lg leading-loose text-text-soft">{w.description}</p>

            <dl className="mt-8 grid gap-4 sm:grid-cols-2">
              {[
                { label: 'الموعد', value: dateFmt.format(starts) },
                { label: 'التوقيت', value: `${timeFmt.format(starts)} — ${timeFmt.format(ends)}` },
                { label: 'المكان', value: w.locationKind === 'online' ? 'أونلاين مباشر (Zoom)' : 'حضوري' },
                { label: 'المقاعد', value: soldOut ? 'اكتمل العدد' : `${seatsLeft.toLocaleString('ar-EG')} من ${w.seatsTotal.toLocaleString('ar-EG')} متاح` },
              ].map((row) => (
                <div key={row.label} className="rounded-2xl border border-line bg-ivory/60 p-4">
                  <dt className="text-xs font-semibold text-taupe">{row.label}</dt>
                  <dd className="tnum mt-1 font-bold text-deep-teal">{row.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <Card className="lg:sticky lg:top-24">
            {!soldOut && seatsLeft <= 15 && (
              <Badge tone="burgundy" className="mb-4">{`باقٍ ${seatsLeft.toLocaleString('ar-EG')} مقعدًا فقط`}</Badge>
            )}
            <p className="flex items-baseline gap-3">
              <span className="tnum text-3xl font-bold text-burgundy">{formatPrice(w.price)}</span>
              {w.compareAtPrice && (
                <span className="tnum text-lg text-taupe line-through">{formatPrice(w.compareAtPrice)}</span>
              )}
            </p>
            <div className="mt-5 border-t border-line pt-5">
              <p className="mb-3 text-center text-sm font-semibold text-deep-teal">تبدأ الورشة خلال</p>
              <Countdown target={w.startsAt} expiredLabel="بدأت الورشة" />
            </div>
            {soldOut ? (
              <p className="mt-6 rounded-2xl bg-sand/50 px-4 py-3 text-center text-sm font-semibold text-taupe">
                اكتمل العدد — راسلينا لننبهك للورشة القادمة
              </p>
            ) : (
              <Button href={`/checkout/workshop/${w.slug}`} size="lg" className="mt-6 w-full">
                احجزي مقعدك الآن
              </Button>
            )}
            <p className="mt-3 text-center text-xs text-taupe">يشمل التسجيل: الحضور المباشر + التسجيل + ملفات العمل</p>
          </Card>
        </div>
      </section>

      <CTARibbon
        title="مواعيد الورش لا تناسبك؟"
        lead="ابدئي بدورة مسجلة في وقتك الخاص."
        ctaLabel="تصفّحي الدورات"
        ctaHref="/courses"
      />
    </main>
  )
}
