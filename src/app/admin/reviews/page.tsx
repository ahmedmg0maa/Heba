import type { Metadata } from 'next'
import { adminList } from '@/lib/data/cms'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { Stars } from '@/components/catalog/Stars'
import { ReviewControls } from '@/components/admin/AdminControls'

export const metadata: Metadata = { title: 'التقييمات — الإدارة' }

type Row = {
  id: string
  display_name: string | null
  rating: number
  comment: string
  is_approved: boolean
  is_featured: boolean
  created_at: string
  products: { title: string } | { title: string }[] | null
}

export default async function AdminReviewsPage() {
  const reviews = await adminList<Row>(
    'reviews',
    'id, display_name, rating, comment, is_approved, is_featured, created_at, products(title)',
    { orderBy: 'created_at' },
  )

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-deep-teal">التقييمات</h1>
        <p className="mt-1 text-text-soft">المعتمد يظهر على صفحات المنتجات؛ المميّز يظهر في الرئيسية أيضًا.</p>
      </header>

      {reviews.length === 0 ? (
        <EmptyState title="لا تقييمات بعد" description="تظهر تقييمات العميلات هنا فور إرسالها لاعتمادها أو حذفها." />
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => {
            const product = Array.isArray(r.products) ? r.products[0] : r.products
            return (
              <Card key={r.id} className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-deep-teal">{r.display_name ?? 'عميلة'}</span>
                    <Stars rating={r.rating} />
                    {r.is_approved ? <Badge tone="success">معتمد</Badge> : <Badge tone="pending">بانتظار المراجعة</Badge>}
                    {r.is_featured && <Badge tone="gold">مميّز</Badge>}
                  </div>
                  {product && <span className="text-xs text-taupe">{product.title}</span>}
                </div>
                <p className="leading-relaxed text-ink">{r.comment}</p>
                <ReviewControls id={r.id} approved={r.is_approved} featured={r.is_featured} />
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
