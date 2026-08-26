import Link from 'next/link'
import { Section } from '@/components/ui/Section'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import type { HomeArticle } from '@/lib/data/home'

export function FeaturedArticles({ articles }: { articles: HomeArticle[] }) {
  if (articles.length === 0) return null
  return (
    <Section tone="white" eyebrow="قراءات منتقاة" title="مقالات تعيد ترتيب الفكرة" lead="مساحات قصيرة للتأمل والفهم والتطبيق.">
      <div className="grid gap-6 md:grid-cols-3">
        {articles.map((a) => (
          <Card key={a.slug} hover as="article" className="relative flex flex-col overflow-hidden pt-8">
            <span className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-antique-gold/10 via-antique-gold/70 to-antique-gold/10" aria-hidden />
            <h3 className="text-lg font-bold text-deep-teal">
              <Link href={`/articles/${a.slug}`} className="hover:text-burgundy">
                {a.title}
              </Link>
            </h3>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-text-soft">{a.excerpt}</p>
            <Link href={`/articles/${a.slug}`} className="mt-4 text-sm font-semibold text-burgundy">
              اقرئي المقال كاملًا
            </Link>
          </Card>
        ))}
      </div>
      <div className="mt-10 text-center">
        <Button href="/articles" variant="secondary">
          جميع المقالات
        </Button>
      </div>
    </Section>
  )
}
