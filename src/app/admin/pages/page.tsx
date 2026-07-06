import type { Metadata } from 'next'
import { adminList } from '@/lib/data/cms'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { PublishToggle } from '@/components/admin/AdminControls'
import { PageSeoForm } from '@/components/admin/PageSeoForm'

export const metadata: Metadata = { title: 'الصفحات — الإدارة' }

type Row = {
  id: string
  slug: string
  title: string
  seo_title: string | null
  seo_description: string | null
  is_published: boolean
}

export default async function AdminPagesPage() {
  const pages = await adminList<Row>('pages', 'id, slug, title, seo_title, seo_description, is_published', {
    orderBy: 'slug',
    ascending: true,
  })

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-deep-teal">الصفحات</h1>
        <p className="mt-1 text-text-soft">عناوين SEO والوصف لكل صفحة، مع التحكم في النشر.</p>
      </header>

      {pages.length === 0 ? (
        <EmptyState
          title="لا صفحات CMS بعد"
          description="الصفحات الأساسية مبنية في الكود؛ أنشئي صفوف pages لصفحات ديناميكية إضافية وستُدار من هنا."
        />
      ) : (
        <div className="space-y-5">
          {pages.map((p) => (
            <Card key={p.id} className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="font-bold text-deep-teal">{p.title}</h2>
                  <p className="text-xs text-taupe" dir="ltr">/{p.slug}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge tone={p.is_published ? 'success' : 'sand'}>{p.is_published ? 'منشورة' : 'مخفية'}</Badge>
                  <PublishToggle table="pages" id={p.id} published={p.is_published} />
                </div>
              </div>
              <PageSeoForm pageId={p.id} seoTitle={p.seo_title ?? ''} seoDescription={p.seo_description ?? ''} />
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
