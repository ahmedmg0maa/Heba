import type { Metadata } from 'next'
import { adminList } from '@/lib/data/cms'
import { Table, THead, TBody, TR, TH, TD } from '@/components/ui/Table'
import { EmptyState } from '@/components/ui/EmptyState'

export const metadata: Metadata = { title: 'الوسائط — الإدارة' }

type Row = { id: string; bucket: string; path: string; alt: string; kind: string; size_bytes: number | null; created_at: string }

const dateFmt = new Intl.DateTimeFormat('ar-EG', { day: 'numeric', month: 'short' })

function fmtSize(bytes: number | null) {
  if (!bytes) return '—'
  if (bytes > 1_048_576) return `${(bytes / 1_048_576).toFixed(1)} م.ب`
  return `${Math.round(bytes / 1024)} ك.ب`
}

export default async function AdminMediaPage() {
  const assets = await adminList<Row>('media_assets', 'id, bucket, path, alt, kind, size_bytes, created_at', {
    orderBy: 'created_at',
    limit: 200,
  })

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-deep-teal">الوسائط</h1>
        <p className="mt-1 text-text-soft">سجل الأصول المرفوعة عبر مخازن Supabase.</p>
      </header>

      {assets.length === 0 ? (
        <EmptyState
          title="لا وسائط مسجلة بعد"
          description="ارفعي الملفات إلى مخازن Supabase (public-media للعام، والمخازن الخاصة للمحتوى المحمي) وسجّليها هنا لسهولة التتبع."
        />
      ) : (
        <Table>
          <THead>
            <tr>
              <TH>الملف</TH>
              <TH>المخزن</TH>
              <TH>النوع</TH>
              <TH>الحجم</TH>
              <TH>رُفع</TH>
            </tr>
          </THead>
          <TBody>
            {assets.map((a) => (
              <TR key={a.id}>
                <TD>
                  <p className="font-semibold text-deep-teal" dir="ltr">{a.path}</p>
                  {a.alt && <p className="text-xs text-taupe">{a.alt}</p>}
                </TD>
                <TD>
                  <span dir="ltr">{a.bucket}</span>
                </TD>
                <TD>{a.kind}</TD>
                <TD>{fmtSize(a.size_bytes)}</TD>
                <TD>{dateFmt.format(new Date(a.created_at))}</TD>
              </TR>
            ))}
          </TBody>
        </Table>
      )}
    </div>
  )
}
