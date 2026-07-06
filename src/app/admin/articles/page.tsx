import type { Metadata } from 'next'
import { adminList } from '@/lib/data/cms'
import { Card, CardTitle } from '@/components/ui/Card'
import { Table, THead, TBody, TR, TH, TD } from '@/components/ui/Table'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { ArticleForm, PublishToggle } from '@/components/admin/AdminControls'

export const metadata: Metadata = { title: 'المقالات — الإدارة' }

type Row = { id: string; title: string; slug: string; is_published: boolean; published_at: string | null; created_at: string }

const dateFmt = new Intl.DateTimeFormat('ar-EG', { day: 'numeric', month: 'short', year: 'numeric' })

export default async function AdminArticlesPage() {
  const articles = await adminList<Row>('articles', 'id, title, slug, is_published, published_at, created_at', {
    orderBy: 'created_at',
  })

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-deep-teal">المقالات</h1>
        <p className="mt-1 text-text-soft">اكتبي كمسودة ثم انشري حين تجهز — المنشور يظهر فورًا في المدونة.</p>
      </header>

      <Card className="p-8">
        <CardTitle className="mb-6">مقال جديد</CardTitle>
        <ArticleForm />
      </Card>

      {articles.length === 0 ? (
        <EmptyState title="لا مقالات بعد" description="أول مقالاتك يبدأ من النموذج أعلاه." />
      ) : (
        <Table>
          <THead>
            <tr>
              <TH>المقال</TH>
              <TH>أُنشئ</TH>
              <TH>الحالة</TH>
              <TH>الإجراء</TH>
            </tr>
          </THead>
          <TBody>
            {articles.map((a) => (
              <TR key={a.id}>
                <TD>
                  <p className="font-semibold text-deep-teal">{a.title}</p>
                  <p className="text-xs text-taupe" dir="ltr">/articles/{a.slug}</p>
                </TD>
                <TD>{dateFmt.format(new Date(a.created_at))}</TD>
                <TD>
                  <Badge tone={a.is_published ? 'success' : 'sand'}>{a.is_published ? 'منشور' : 'مسودة'}</Badge>
                </TD>
                <TD>
                  <PublishToggle table="articles" id={a.id} published={a.is_published} isArticle />
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      )}
    </div>
  )
}
