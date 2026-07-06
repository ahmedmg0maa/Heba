import type { Metadata } from 'next'
import { adminList } from '@/lib/data/cms'
import { Table, THead, TBody, TR, TH, TD } from '@/components/ui/Table'
import { EmptyState } from '@/components/ui/EmptyState'

export const metadata: Metadata = { title: 'العملاء — الإدارة' }

type Row = { id: string; full_name: string; email: string; phone: string | null; created_at: string }

const dateFmt = new Intl.DateTimeFormat('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' })

export default async function AdminUsersPage() {
  const users = await adminList<Row>('profiles', 'id, full_name, email, phone, created_at', {
    orderBy: 'created_at',
    limit: 200,
  })

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-deep-teal">العملاء</h1>
        <p className="mt-1 text-text-soft">أحدث ٢٠٠ حساب — الأدوار الإدارية تُدار من صفحة الأدوار.</p>
      </header>

      {users.length === 0 ? (
        <EmptyState title="لا حسابات بعد" description="تظهر العميلات هنا فور تسجيلهن في المنصة." />
      ) : (
        <Table>
          <THead>
            <tr>
              <TH>الاسم</TH>
              <TH>البريد</TH>
              <TH>الهاتف</TH>
              <TH>انضمت</TH>
            </tr>
          </THead>
          <TBody>
            {users.map((u) => (
              <TR key={u.id}>
                <TD className="font-semibold text-deep-teal">{u.full_name || '—'}</TD>
                <TD>
                  <span dir="ltr">{u.email}</span>
                </TD>
                <TD>{u.phone ? <span dir="ltr">{u.phone}</span> : '—'}</TD>
                <TD>{dateFmt.format(new Date(u.created_at))}</TD>
              </TR>
            ))}
          </TBody>
        </Table>
      )}
    </div>
  )
}
