import type { Metadata } from 'next'
import { getServerClient } from '@/lib/supabase/server'
import { adminList } from '@/lib/data/cms'
import { Table, THead, TBody, TR, TH, TD } from '@/components/ui/Table'
import { EmptyState } from '@/components/ui/EmptyState'
import { NotifyUser } from '@/components/admin/NotifyUser'

export const metadata: Metadata = { title: 'العملاء — الإدارة' }

type Row = { id: string; full_name: string; email: string; phone: string | null; created_at: string }

const dateFmt = new Intl.DateTimeFormat('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' })

const hasEnv = () =>
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

async function searchUsers(q: string): Promise<Row[]> {
  if (!hasEnv()) return []
  try {
    const supabase = await getServerClient()
    const like = `%${q.replace(/[%_]/g, '')}%`
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name, email, phone, created_at')
      .or(`full_name.ilike.${like},email.ilike.${like}`)
      .order('created_at', { ascending: false })
      .limit(50)
    return (data ?? []) as Row[]
  } catch {
    return []
  }
}

type Props = { searchParams: Promise<{ q?: string }> }

export default async function AdminUsersPage({ searchParams }: Props) {
  const { q } = await searchParams
  const users = q?.trim()
    ? await searchUsers(q.trim())
    : await adminList<Row>('profiles', 'id, full_name, email, phone, created_at', {
        orderBy: 'created_at',
        limit: 200,
      })

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-deep-teal">العملاء</h1>
          <p className="mt-1 text-text-soft">
            {q ? `نتائج البحث عن «${q}»` : 'أحدث ٢٠٠ حساب — ويمكنك مراسلة أي عميلة بإشعار مباشر.'}
          </p>
        </div>
        <form className="flex gap-2">
          <label htmlFor="q" className="sr-only">
            بحث
          </label>
          <input
            id="q"
            name="q"
            defaultValue={q ?? ''}
            placeholder="الاسم أو البريد…"
            className="w-56 rounded-full border border-line bg-soft-white px-4 py-2 text-sm shadow-card focus:border-deep-teal focus:outline-2 focus:outline-deep-teal/20"
          />
          <button type="submit" className="rounded-full bg-deep-teal px-5 py-2 text-sm font-semibold text-soft-white">
            بحث
          </button>
        </form>
      </header>

      {users.length === 0 ? (
        <EmptyState
          title={q ? 'لا نتائج لهذا البحث' : 'لا حسابات بعد'}
          description={q ? 'جرّبي جزءًا من الاسم أو البريد الإلكتروني.' : 'تظهر العميلات هنا فور تسجيلهن في المنصة.'}
        />
      ) : (
        <Table>
          <THead>
            <tr>
              <TH>الاسم</TH>
              <TH>البريد</TH>
              <TH>الهاتف</TH>
              <TH>انضمت</TH>
              <TH>تواصل</TH>
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
                <TD>
                  <NotifyUser userId={u.id} userName={u.full_name || u.email} />
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      )}
    </div>
  )
}
