import type { Metadata } from 'next'
import { getMyBooks } from '@/lib/data/dashboard'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'

export const metadata: Metadata = { title: 'كتبي' }

const dateFmt = new Intl.DateTimeFormat('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' })

export default async function MyBooksPage() {
  const books = await getMyBooks()

  return (
    <div className="mx-auto max-w-4xl">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-deep-teal">كتبي</h1>
        <p className="mt-1 text-text-soft">مكتبتك الخاصة — حمّلي كتبك في أي وقت وعلى أي جهاز.</p>
      </header>

      {books.length === 0 ? (
        <EmptyState
          title="مكتبتك فارغة حاليًا"
          description="حين تشترين كتابًا وتُعتمد دفعتك يظهر هنا جاهزًا للتحميل الفوري."
          actionLabel="تصفّحي الكتب"
          actionHref="/books"
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2">
          {books.map((b) => (
            <Card key={b.slug} hover className="flex gap-5">
              <div className="flex h-28 w-20 shrink-0 flex-col justify-between rounded-lg bg-linear-to-br from-burgundy to-burgundy-soft p-3">
                <span className="h-px w-6 bg-muted-gold" aria-hidden />
                <span className="font-heading text-xs font-bold leading-snug text-on-dark">
                  {b.title.replace('كتاب ', '')}
                </span>
              </div>
              <div className="flex flex-1 flex-col">
                <h2 className="font-bold text-deep-teal">{b.title}</h2>
                <p className="tnum mt-1 flex-1 text-xs text-taupe">
                  {b.pagesCount ? `${b.pagesCount.toLocaleString('ar-EG')} صفحة · ` : ''}
                  أُضيف {dateFmt.format(new Date(b.grantedAt))}
                </p>
                <Button href={`/dashboard/books/${b.slug}/download`} variant="secondary" size="sm" className="self-start">
                  تحميل الكتاب
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
