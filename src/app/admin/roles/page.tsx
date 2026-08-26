import type { Metadata } from 'next'
import { adminList } from '@/lib/data/cms'
import { getServerClient } from '@/lib/supabase/server'
import { Card, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Table, THead, TBody, TR, TH, TD } from '@/components/ui/Table'
import { EmptyState } from '@/components/ui/EmptyState'
import { RoleForm, RevokeRoleButton } from '@/components/admin/AdminControls'
import { RolePermissionEditor } from '@/components/admin/RolePermissionEditor'
import { PERMISSIONS } from '@/lib/auth/permissions'

export const metadata: Metadata = { title: 'الأدوار — الإدارة' }

type Row = { id: string; user_id: string; role: string; created_at: string }
type PermissionRow = { role: string; permission: string }

const roleLabels: Record<string, { label: string; tone: 'burgundy' | 'teal' | 'cobalt' | 'gold' }> = {
  owner: { label: 'مالكة', tone: 'burgundy' },
  admin: { label: 'مديرة', tone: 'teal' },
  operations: { label: 'العمليات', tone: 'cobalt' },
  finance: { label: 'المالية', tone: 'gold' },
  content: { label: 'إدارة المحتوى', tone: 'teal' },
  marketing: { label: 'التسويق', tone: 'burgundy' },
  support: { label: 'دعم', tone: 'cobalt' },
  editor: { label: 'محررة', tone: 'gold' },
}

const dateFmt = new Intl.DateTimeFormat('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' })

export default async function AdminRolesPage() {
  const roles = await adminList<Row>('admin_roles', 'id, user_id, role, created_at', {
    orderBy: 'created_at',
    ascending: true,
  })
  const permissions = await adminList<PermissionRow>('admin_permissions', 'role, permission', { orderBy: 'permission', ascending: true, limit: 300 })

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

      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold text-deep-teal">مصفوفة الصلاحيات الفعلية</h2>
          <p className="text-sm text-text-soft">المالكة تملك جميع الصلاحيات، وباقي الأدوار مقيدة بالمفاتيح المسجلة في قاعدة البيانات.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {Object.entries(roleLabels).map(([role, meta]) => {
            const keys = role === 'owner' ? ['* — جميع الصلاحيات'] : permissions.filter((item) => item.role === role).map((item) => item.permission)
            return <Card key={role} className="p-5"><div className="flex items-center justify-between"><Badge tone={meta.tone}>{meta.label}</Badge><span className="text-xs text-text-soft">{keys.length.toLocaleString('ar-EG')} صلاحية</span></div><ul className="mt-4 grid gap-1 text-xs text-text-soft" dir="ltr">{keys.map((key) => <li key={key} className="rounded-lg bg-ivory/55 px-3 py-1.5">{key}</li>)}</ul>{role!=='owner'&&<RolePermissionEditor role={role} allPermissions={[...PERMISSIONS]} selected={keys}/>}</Card>
          })}
        </div>
      </section>

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
