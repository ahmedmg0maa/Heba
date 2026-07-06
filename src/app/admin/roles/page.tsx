import type { Metadata } from 'next'
import { adminList } from '@/lib/data/cms'
import { getServerClient } from '@/lib/supabase/server'
import { Card, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Table, THead, TBody, TR, TH, TD } from '@/components/ui/Table'
import { EmptyState } from '@/components/ui/EmptyState'
import { RoleForm, RevokeRoleButton } from '@/components/admin/AdminControls'

export const metadata: Metadata = { title: 'الأدوار — الإدارة' }

type Row = { id: string; user_id: string; role: string; created_at: string }

const roleLabels: Record<string, { label: string; tone: 'burgundy' | 'teal' | 'cobalt' | 'gold' }> = {
  owner: { label: 'مالكة', tone: 'burgundy' },
  admin: { label: 'مديرة', tone: 'teal' },
  support: { label: 'دعم', tone: 'cobalt' },
  editor: { label: 'محررة', tone: 'gold' },
}

const dateFmt = new Intl.DateTimeFormat('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' })

export default async function AdminRolesPage() {
  const roles = await adminList<Row>('admin_roles', 'id, user_id, role, created_at', {
    orderBy: 'created_at',
    ascending: true,
  })

  let emails = new Map<string, string>()
  if (roles.length > 0) {
    try {
      const supabase = await getServerClient()
      const { data } = await supabase
        .from('profiles')
        .select('id, email')
        .in('id', [...new Set(roles.map((r) => r.user_id))])
      emails = new Map((data ?? []).map((p) => [p.id, p.email]))
    } catch {
      // emails stay empty; ids shown instead
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-deep-teal">الأدوار والصلاحيات</h1>
        <p className="mt-1 text-text-soft">منح الأدوار وسحبها متاح للمالكة فقط — كل تغيير يُسجل في سجل التدقيق.</p>
      </header>

      <Card className="p-8">
        <CardTitle className="mb-6">منح دور</CardTitle>
        <RoleForm />
      </Card>

      {roles.length === 0 ? (
        <EmptyState
          title="لا أدوار ممنوحة بعد"
          description="امنحي دور «مالكة» لحسابك الأول عبر SQL (خطوات docs/SUPABASE_SETUP.md §5) ثم أديري الباقي من هنا."
        />
      ) : (
        <Table>
          <THead>
            <tr>
              <TH>العضوة</TH>
              <TH>الدور</TH>
              <TH>مُنح</TH>
              <TH>الإجراء</TH>
            </tr>
          </THead>
          <TBody>
            {roles.map((r) => {
              const meta = roleLabels[r.role] ?? { label: r.role, tone: 'teal' as const }
              return (
                <TR key={r.id}>
                  <TD>
                    <span dir="ltr">{emails.get(r.user_id) ?? r.user_id}</span>
                  </TD>
                  <TD>
                    <Badge tone={meta.tone}>{meta.label}</Badge>
                  </TD>
                  <TD>{dateFmt.format(new Date(r.created_at))}</TD>
                  <TD>
                    <RevokeRoleButton roleId={r.id} />
                  </TD>
                </TR>
              )
            })}
          </TBody>
        </Table>
      )}
    </div>
  )
}
