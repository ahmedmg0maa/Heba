import Image from 'next/image'
import Link from 'next/link'
import { Section } from '@/components/ui/Section'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import type { HomeArticle } from '@/lib/data/home'
import { DEFAULT_HOME_CONTENT, type ArticlesContent } from '@/lib/home/sections'

export function FeaturedArticles({ articles, content = DEFAULT_HOME_CONTENT.articles as ArticlesContent }: { articles: HomeArticle[]; content?: ArticlesContent }) {
  if (articles.length === 0) return null
  const visuals = ['/brand/catalog-still-life.webp', '/images/experience/editorial-reflection-studio.webp', '/images/experience/journey-landscape.webp']
  return (
    <Section tone="white" eyebrow={content.eyebrow} title={content.heading} lead={content.lead}>
      <div className="grid gap-6 md:grid-cols-3">
        {articles.map((a, index) => (
          <Card key={a.slug} hover as="article" className="relative flex flex-col overflow-hidden p-0">
            <span className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-antique-gold/10 via-antique-gold/70 to-antique-gold/10" aria-hidden />
            <div className="relative h-44 overflow-hidden">
              <Image src={visuals[index % visuals.length]} alt="" fill unoptimized sizes="(min-width: 768px) 33vw, 100vw" className="object-cover transition duration-700 hover:scale-105" />
              <span className="absolute inset-0 bg-linear-to-t from-[#082730]/46 to-transparent" aria-hidden />
            </div>
            <div className="flex flex-1 flex-col p-6">
              <h3 className="text-lg font-bold text-deep-teal">
                <Link href={`/articles/${a.slug}`} className="hover:text-burgundy">{a.title}</Link>
              </h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-text-soft">{a.excerpt}</p>
              <Link href={`/articles/${a.slug}`} className="mt-4 text-sm font-semibold text-burgundy">اقرئي المقال كاملًا</Link>
            </div>
          </Card>
        ))}
      </div>
      <div className="mt-10 text-center">
        <Button href="/articles" variant="secondary">
          {content.ctaLabel}
        </Button>
      </div>
    </Section>
  )
}
