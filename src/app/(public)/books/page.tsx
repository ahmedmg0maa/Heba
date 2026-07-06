import type { Metadata } from 'next'
import { listBooks } from '@/lib/data/catalog'
import { PageHero } from '@/components/catalog/PageHero'
import { ProductCard } from '@/components/catalog/ProductCard'
import { CTARibbon } from '@/components/catalog/CTARibbon'
import { Section } from '@/components/ui/Section'

export const metadata: Metadata = {
  title: 'الكتب الرقمية',
  description: 'كتب عملية بتمارين ونماذج تدوين، تُحمَّل فورًا وترافقك أينما كنتِ.',
}

export const revalidate = 300

export default async function BooksPage() {
  const books = await listBooks()

  return (
    <main>
      <PageHero
        eyebrow="الكتب الرقمية"
        title="كتب تُقرأ بالقلم، لا بالعين فقط"
        lead="كل كتاب مصمم كرحلة عملية: تأملات قصيرة، تمارين تطبيقية، ومساحات تدوين — يصلك فورًا بصيغة PDF أنيقة."
      />

      <Section eyebrow="المكتبة" title="إصداراتنا">
        <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-2">
          {books.map((b) => (
            <ProductCard
              key={b.slug}
              href={`/books/${b.slug}`}
              title={b.title}
              subtitle={b.subtitle}
              description={b.description}
              price={b.price}
              compareAtPrice={b.compareAtPrice}
              coverKind="book"
              badge={b.compareAtPrice ? { label: 'خصم محدود', tone: 'burgundy' } : undefined}
              meta={[
                b.pagesCount ? `${b.pagesCount.toLocaleString('ar-EG')} صفحة` : 'كتاب رقمي',
                'تحميل فوري',
                'تحديثات مجانية',
              ]}
            />
          ))}
        </div>
      </Section>

      <CTARibbon
        title="تفضّلين التعلم بالفيديو؟"
        lead="استكشفي دوراتنا التدريبية المعمقة."
        ctaLabel="تصفّحي الدورات"
        ctaHref="/courses"
      />
    </main>
  )
}
