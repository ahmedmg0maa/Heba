import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getBook, formatPrice } from '@/lib/data/catalog'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { CTARibbon } from '@/components/catalog/CTARibbon'
import { MobileBuyBar } from '@/components/catalog/MobileBuyBar'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const book = await getBook((await params).slug)
  return book ? { title: book.title, description: book.description } : { title: 'كتاب غير موجود' }
}

export const revalidate = 300

export default async function BookDetailPage({ params }: Props) {
  const book = await getBook((await params).slug)
  if (!book) notFound()

  const includes = [
    book.pagesCount ? `${book.pagesCount.toLocaleString('ar-EG')} صفحة مصممة بعناية` : 'كتاب رقمي كامل',
    'صيغة PDF أنيقة تعمل على كل الأجهزة',
    'تحميل فوري بعد تأكيد الدفع',
    'كل التحديثات المستقبلية مجانًا',
  ]

  return (
    <main>
      <section className="border-b border-line bg-soft-white">
        <div className="mx-auto grid max-w-6xl items-start gap-10 px-6 py-14 lg:grid-cols-[1fr_1.4fr]">
          {/* branded cover substitute */}
          <div className="mx-auto w-full max-w-xs">
            <div className="flex aspect-3/4 flex-col justify-between rounded-2xl bg-linear-to-br from-burgundy to-burgundy-soft p-8 shadow-card-hover">
              <span className="h-px w-12 bg-muted-gold" aria-hidden />
              <div>
                <h2 className="font-heading text-3xl font-bold leading-snug text-soft-white">{book.title.replace('كتاب ', '')}</h2>
                <p className="mt-2 text-sm text-soft-white/70">{book.subtitle}</p>
              </div>
              <p className="text-sm font-semibold tracking-widest text-muted-gold">هبة الشريف</p>
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-semibold tracking-widest text-antique-gold">{book.subtitle}</p>
            <h1 className="text-4xl font-bold text-deep-teal">{book.title}</h1>
            <p className="mt-5 max-w-2xl text-lg leading-loose text-text-soft">{book.description}</p>

            <Card className="mt-8 max-w-md">
              <p className="flex items-baseline gap-3">
                <span className="tnum text-3xl font-bold text-burgundy">{formatPrice(book.price)}</span>
                {book.compareAtPrice && (
                  <span className="tnum text-lg text-taupe line-through">{formatPrice(book.compareAtPrice)}</span>
                )}
                {book.compareAtPrice && <Badge tone="burgundy">خصم محدود</Badge>}
              </p>
              <ul className="mt-5 space-y-2.5 border-t border-line pt-5 text-sm text-ink">
                {includes.map((item) => (
                  <li key={item} className="flex items-center gap-2.5">
                    <svg viewBox="0 0 20 20" className="h-4 w-4 shrink-0 text-deep-teal" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                      <path d="M4 10.5l4 4 8-9" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
              <Button href={`/checkout/book/${book.slug}`} size="lg" className="mt-6 w-full">
                احصلي على نسختك
              </Button>
            </Card>
          </div>
        </div>
      </section>

      <CTARibbon
        title="تحبين المرافقة المعمقة؟"
        lead="دوراتنا التدريبية تأخذك من القراءة إلى التطبيق."
        ctaLabel="تصفّحي الدورات"
        ctaHref="/courses"
      />
      <MobileBuyBar
        price={book.price}
        compareAtPrice={book.compareAtPrice}
        ctaLabel="احصلي على نسختك"
        ctaHref={`/checkout/book/${book.slug}`}
      />
    </main>
  )
}
