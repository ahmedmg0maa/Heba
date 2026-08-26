import type { Metadata } from 'next'
import Link from 'next/link'
import { listArticles } from '@/lib/data/catalog'
import { PageHero } from '@/components/catalog/PageHero'
import { Section } from '@/components/ui/Section'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'

export const metadata: Metadata = {
  title: 'المقالات',
  description: 'مقالات منشورة من المنصة في الوعي والنمو الهادئ.',
}

export const revalidate = 300

const dateFmt = new Intl.DateTimeFormat('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' })

export default async function ArticlesPage() {
  const articles = await listArticles()

  return (
    <main>
      <PageHero
        eyebrow="المدونة"
        title="قراءات ترافق فنجان قهوتك"
        lead="اقرئي المقالات المنشورة عندما تتوفر، وعودي إلى المسارات الرئيسية في أي وقت."
      />

      <Section>
        {articles.length === 0 ? (
          <EmptyState
            title="لا توجد مقالات بعد"
            description="ستظهر المقالات هنا عند نشرها من إدارة المنصة."
            actionLabel="ابدئي من هنا"
            actionHref="/start-here"
          />
        ) : (
          <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
            {articles.map((a) => (
              <Card key={a.slug} hover as="article" className="flex flex-col">
                <span className="mb-4 h-1 w-12 rounded-full bg-antique-gold" aria-hidden />
                {a.publishedAt && (
                  <time dateTime={a.publishedAt} className="tnum mb-2 text-xs text-taupe">
                    {dateFmt.format(new Date(a.publishedAt))}
                  </time>
                )}
                <h2 className="text-lg font-bold text-deep-teal">
                  <Link href={`/articles/${a.slug}`} className="hover:text-burgundy">
                    {a.title}
                  </Link>
                </h2>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-text-soft">{a.excerpt}</p>
                <Link href={`/articles/${a.slug}`} className="mt-4 text-sm font-semibold text-burgundy">
                  اقرئي المقال
                </Link>
              </Card>
            ))}
          </div>
        )}
      </Section>
    </main>
  )
}
