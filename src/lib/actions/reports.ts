'use server'

import { revalidatePath } from 'next/cache'
import { getServerClient, getServiceClient } from '@/lib/supabase/server'
import { getReports } from '@/lib/data/reports'

type ActionResult = { ok: true } | { ok: false; error: string }

const hasEnv = () =>
  Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
      process.env.SUPABASE_SERVICE_ROLE_KEY,
  )

export async function saveReportSnapshot(): Promise<ActionResult> {
  if (!hasEnv()) return { ok: false, error: 'غير متاح في بيئة العرض التجريبية.' }
  const supabase = await getServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'سجّلي دخولك أولًا.' }
  const { data: role } = await supabase.from('admin_roles').select('role').eq('user_id', user.id).limit(1).maybeSingle()
  if (!role) return { ok: false, error: 'هذه العملية تتطلب صلاحية إدارية.' }

  const reports = await getReports()
  const now = new Date()
  const periodStart = new Date(now.getFullYear(), now.getMonth() - 11, 1)

  const { error } = await getServiceClient().from('report_snapshots').insert({
    kind: 'monthly_overview',
    period_start: periodStart.toISOString().slice(0, 10),
    period_end: now.toISOString().slice(0, 10),
    data: {
      revenue: reports.revenue,
      enrollments: reports.enrollments,
      bookings: reports.bookings,
      captured_by: user.id,
    },
  })
  if (error) return { ok: false, error: 'تعذّر حفظ اللقطة.' }
  revalidatePath('/admin/reports')
  return { ok: true }
}
