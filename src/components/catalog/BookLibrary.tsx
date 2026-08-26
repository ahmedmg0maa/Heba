'use client'

import { useMemo, useState } from 'react'
import type { CatalogBook } from '@/lib/data/catalog'
import { ProductCard } from './ProductCard'

export function BookLibrary({ books }: { books: CatalogBook[] }) {
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState('featured')

  const filtered = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase('ar')
    const result = books.filter((book) => !normalized || `${book.title} ${book.subtitle} ${book.description}`.toLocaleLowerCase('ar').includes(normalized))
    return [...result].sort((a, b) => {
      if (sort === 'price-low') return a.price - b.price
      if (sort === 'price-high') return b.price - a.price
      if (sort === 'pages') return (b.pagesCount ?? 0) - (a.pagesCount ?? 0)
      return 0
    })
  }, [books, query, sort])

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8 grid gap-3 rounded-2xl border border-line bg-surface-raised p-4 shadow-card sm:grid-cols-[1fr_220px]">
        <label>
          <span className="sr-only">البحث في الكتب</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ابحثي باسم الكتاب أو موضوعه…" className="min-h-12 w-full rounded-xl border border-line bg-ivory px-4 text-ink outline-none focus:border-antique-gold" />
        </label>
        <label>
          <span className="sr-only">ترتيب الكتب</span>
          <select value={sort} onChange={(event) => setSort(event.target.value)} className="min-h-12 w-full rounded-xl border border-line bg-ivory px-4 text-ink outline-none focus:border-antique-gold">
            <option value="featured">الترتيب المقترح</option>
            <option value="price-low">السعر: الأقل أولًا</option>
            <option value="price-high">السعر: الأعلى أولًا</option>
            <option value="pages">الأكثر صفحات</option>
          </select>
        </label>
      </div>
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line bg-surface-raised p-10 text-center text-text-soft">لا توجد كتب مطابقة لهذا البحث.</div>
      ) : (
        <div className="grid gap-8 md:grid-cols-2">
          {filtered.map((book) => (
            <ProductCard
              key={book.slug}
              href={`/books/${book.slug}`}
              title={book.title}
              subtitle={book.subtitle}
              description={book.description}
              price={book.price}
              compareAtPrice={book.compareAtPrice}
              coverKind="book"
              badge={book.compareAtPrice ? { label: 'سعر مخفّض', tone: 'burgundy' } : undefined}
              meta={[book.pagesCount ? `${book.pagesCount.toLocaleString('ar-EG')} صفحة` : 'كتاب رقمي', 'يظهر بعد تأكيد الدفع', 'محفوظ داخل حسابك']}
            />
          ))}
        </div>
      )}
    </div>
  )
}
