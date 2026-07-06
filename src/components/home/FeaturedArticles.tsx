import Link from 'next/link'
import { Section } from '@/components/ui/Section'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import type { HomeArticle } from '@/lib/data/home'

export function FeaturedArticles({ articles }: { articles: HomeArticle[] }) {
  if (articles.length === 0) return null
  return (
    <Section tone="white" eyebrow="من المدونة" title="مقالات مختارة" lead="قراءات قصيرة وعملية ترافق فنجان قهوتك.">
      <div className="grid gap-6 md:grid-cols-3">
        {articles.map((a) => (
          <Card key={a.slug} hover as="article" className="flex flex-col">
            <span className="mb-4 h-1 w-12 rounded-full bg-antique-gold" aria-hidden />
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
