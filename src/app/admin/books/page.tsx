import type { Metadata } from 'next'
import { adminList } from '@/lib/data/cms'
import { Table, THead, TBody, TR, TH, TD } from '@/components/ui/Table'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { PublishToggle } from '@/components/admin/AdminControls'

export const metadata: Metadata = { title: 'الكتب — الإدارة' }

type Row = {
  id: string
  title: string
  slug: string
  pages_count: number | null
  is_published: boolean
  book_files: { id: string }[]
  book_access: { id: string }[]
}

export default async function AdminBooksPage() {
  const books = await adminList<Row>('books', 'id, title, slug, pages_count, is_published, book_files(id), book_access(id)')

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-deep-teal">الكتب</h1>
        <p className="mt-1 text-text-soft">إصدارات المكتبة الرقمية وملفاتها وعدد مالكاتها.</p>
      </header>

      {books.length === 0 ? (
        <EmptyState title="لا كتب بعد" description="أضيفي الكتاب وملفاته عبر قاعدة البيانات وسيظهر هنا للنشر والإدارة." />
      ) : (
        <Table>
          <THead>
            <tr>
              <TH>الكتاب</TH>
              <TH>الصفحات</TH>
              <TH>الملفات</TH>
              <TH>المالكات</TH>
              <TH>الحالة</TH>
              <TH>الإجراء</TH>
            </tr>
          </THead>
          <TBody>
            {books.map((b) => (
              <TR key={b.id}>
                <TD>
                  <p className="font-semibold text-deep-teal">{b.title}</p>
                  <p className="text-xs text-taupe" dir="ltr">/{b.slug}</p>
                </TD>
                <TD>{b.pages_count ? b.pages_count.toLocaleString('ar-EG') : '—'}</TD>
                <TD>{(b.book_files ?? []).length.toLocaleString('ar-EG')}</TD>
                <TD>{(b.book_access ?? []).length.toLocaleString('ar-EG')}</TD>
                <TD>
                  <Badge tone={b.is_published ? 'success' : 'sand'}>{b.is_published ? 'منشور' : 'مسودة'}</Badge>
                </TD>
                <TD>
                  <PublishToggle table="books" id={b.id} published={b.is_published} />
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      )}
    </div>
  )
}
