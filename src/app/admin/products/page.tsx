import type { Metadata } from 'next'
import { adminList } from '@/lib/data/cms'
import { formatPrice } from '@/lib/format'
import { Table, THead, TBody, TR, TH, TD } from '@/components/ui/Table'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { PublishToggle } from '@/components/admin/AdminControls'

export const metadata: Metadata = { title: 'المنتجات — الإدارة' }

type Row = { id: string; title: string; type: string; slug: string; price: number; is_published: boolean; sort: number }

const typeLabels: Record<string, string> = {
  course: 'دورة',
  book: 'كتاب',
  workshop: 'ورشة',
  session: 'جلسة',
  bundle: 'حزمة',
  vip: 'VIP',
  free_resource: 'مورد مجاني',
}

export default async function AdminProductsPage() {
  const products = await adminList<Row>('products', 'id, title, type, slug, price, is_published, sort', {
    orderBy: 'sort',
    ascending: true,
  })

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-deep-teal">المنتجات</h1>
        <p className="mt-1 text-text-soft">كل ما يُباع على المنصة — المنشور منه يظهر فورًا في صفحات الاكتشاف.</p>
      </header>

      {products.length === 0 ? (
        <EmptyState
          title="لا منتجات بعد"
          description="تُنشأ المنتجات عبر قاعدة البيانات أو السكربت التجريبي — وستظهر هنا للإدارة والنشر."
        />
      ) : (
        <Table>
          <THead>
            <tr>
              <TH>المنتج</TH>
              <TH>النوع</TH>
              <TH>السعر</TH>
              <TH>الحالة</TH>
              <TH>الإجراء</TH>
            </tr>
          </THead>
          <TBody>
            {products.map((p) => (
              <TR key={p.id}>
                <TD>
                  <p className="font-semibold text-deep-teal">{p.title}</p>
                  <p className="text-xs text-taupe" dir="ltr">/{p.slug}</p>
                </TD>
                <TD>{typeLabels[p.type] ?? p.type}</TD>
                <TD className="font-bold">{formatPrice(Number(p.price))}</TD>
                <TD>
                  <Badge tone={p.is_published ? 'success' : 'sand'}>{p.is_published ? 'منشور' : 'مسودة'}</Badge>
                </TD>
                <TD>
                  <PublishToggle table="products" id={p.id} published={p.is_published} />
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      )}
    </div>
  )
}
