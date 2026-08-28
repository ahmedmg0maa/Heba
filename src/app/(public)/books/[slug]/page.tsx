import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getBook, formatPrice } from '@/lib/data/catalog'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { CTARibbon } from '@/components/catalog/CTARibbon'
import { MobileBuyBar } from '@/components/catalog/MobileBuyBar'
import { getPaymentSettings } from '@/lib/data/checkout'
import { CatalogCoverImage } from '@/components/catalog/CatalogCoverImage'
import { PreviewBookReader } from '@/components/experience/PreviewBookReader'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const book = await getBook((await params).slug)
  return book ? { title: book.title, description: book.description } : { title: 'كتاب غير موجود' }
}

export const revalidate = 300

export default async function BookDetailPage({ params }: Props) {
  const book = await getBook((await params).slug)
  if (!book) notFound()
  const paymentSettings = await getPaymentSettings()
  const orderingAvailable = !book.isPreviewExperience && Boolean(paymentSettings.instapay || paymentSettings.wallet || paymentSettings.bank)

  const includes = [
    book.pagesCount ? `${book.pagesCount.toLocaleString('ar-EG')} صفحة مصممة بعناية` : 'كتاب رقمي كامل',
    'تظهر طريقة الوصول وشروطها بعد اعتماد الطلب، عندما تكون متاحة لهذا الكتاب.',
  ]

  return (
    <main>
      <section className="border-b border-line bg-surface-raised">
        <div className="mx-auto grid max-w-6xl items-start gap-10 px-6 py-14 lg:grid-cols-[1fr_1.4fr]">
          {/* branded cover substitute */}
          <div className="mx-auto w-full max-w-xs">
            {book.coverUrl ? <CatalogCoverImage url={book.coverUrl} title={book.title} className="aspect-3/4 w-full" /> :
            <div className="flex aspect-3/4 flex-col justify-between rounded-2xl bg-linear-to-br from-burgundy to-burgundy-soft p-8 shadow-card-hover">
              <span className="h-px w-12 bg-muted-gold" aria-hidden />
              <div>
                <h2 className="font-heading text-3xl font-bold leading-snug text-on-dark">{book.title.replace('كتاب ', '')}</h2>
                <p className="mt-2 text-sm text-on-dark/70">{book.subtitle}</p>
              </div>
              <p className="text-sm font-semibold tracking-widest text-muted-gold">هبة الشريف</p>
            </div>}
          </div>

          <div>
            {book.isPreviewExperience && <Badge tone="cobalt" className="mb-4">كتاب تجربة أصلي · لا شراء ولا تنزيل</Badge>}
            <p className="mb-2 text-sm font-semibold tracking-widest text-antique-gold">{book.subtitle}</p>
            <h1 className="text-4xl font-bold text-deep-teal">{book.title}</h1>
            <p className="mt-5 max-w-2xl text-lg leading-loose text-text-soft">{book.description}</p>

            <Card className="mt-8 max-w-md">
              <p className="flex items-baseline gap-3">
                {book.isPreviewExperience ? <span className="text-2xl font-bold text-deep-teal">اقرئي الفصول الآن</span> : <>
                <span className="tnum text-3xl font-bold text-burgundy">{formatPrice(book.price)}</span>
                {book.compareAtPrice && (
                  <span className="tnum text-lg text-taupe line-through">{formatPrice(book.compareAtPrice)}</span>
                )}
                {book.compareAtPrice && <Badge tone="burgundy">سعر مخفّض</Badge>}
                </>}
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
              {book.isPreviewExperience ? (
                <Button href="#book-preview" size="lg" className="mt-6 w-full">افتحي قارئة الكتاب</Button>
              ) : orderingAvailable ? (
                <Button href={`/checkout/book/${book.slug}`} size="lg" className="mt-6 w-full">
                  اطلبي النسخة
                </Button>
              ) : (
                <p className="mt-6 rounded-xl bg-ivory px-4 py-3 text-center text-sm font-medium text-text-soft" role="status">
                  الشراء غير متاح قبل تفعيل وسيلة دفع من الإدارة.
                </p>
              )}
            </Card>
          </div>
        </div>
      </section>

      {book.isPreviewExperience && book.previewChapters && <PreviewBookReader chapters={book.previewChapters} />}

      <CTARibbon
        title="تحبين المرافقة المعمقة؟"
        lead="تصفحي الدورات المنشورة واقرئي تفاصيل كل مسار قبل الاختيار."
        ctaLabel="تصفّحي الدورات"
        ctaHref="/courses"
      />
      {orderingAvailable && <MobileBuyBar
        price={book.price}
        compareAtPrice={book.compareAtPrice}
        ctaLabel="اطلبي النسخة"
        ctaHref={`/checkout/book/${book.slug}`}
      />}
    </main>
  )
}
