import type { Metadata } from 'next'
import { getServerClient } from '@/lib/supabase/server'
import { MembershipPlansManager, SubscriptionCreate, SubscriptionCreditControl, SubscriptionStatusControl, type PlanAdmin } from '@/components/admin/MembershipManager'
import { Table, THead, TBody, TR, TH, TD } from '@/components/ui/Table'
import { EmptyState } from '@/components/ui/EmptyState'

export const metadata: Metadata = { title: 'الباقات والاشتراكات — الإدارة' }

export default async function AdminMembershipsPage() {
  const supabase = await getServerClient()
  const [{ data: planRows }, { data: subscriptions }, { data: serviceRows }, { data: packageProducts }] = await Promise.all([
    supabase.from('subscription_plans').select('*, subscription_plan_services(service_id)').is('archived_at', null).order('sort', { ascending: true }),
    supabase.from('subscriptions').select('id, user_id, plan_id, status, starts_at, ends_at, sessions_used, subscription_plans(title, sessions_included), subscription_credit_ledger(delta)').is('archived_at', null).order('created_at', { ascending: false }).limit(200),
    supabase.from('services').select('id,title').eq('is_active', true).order('title'),
    supabase.from('products').select('id,title').in('type',['vip','bundle']).eq('is_published',true).order('title'),
  ])
  const { data: profiles } = await supabase.from('profiles').select('id, full_name, email').order('created_at',{ascending:false}).limit(500)
  const customerProfiles = (profiles ?? []).filter((profile) => !profile.email.endsWith('@example.invalid'))
  const profileMap = new Map(customerProfiles.map((profile) => [profile.id, profile]))
  const plans: PlanAdmin[] = (planRows ?? []).map((plan) => ({
    ...plan,
    price: Number(plan.price),
    features: Array.isArray(plan.features) ? plan.features.map(String) : [],
    activeCount: (subscriptions ?? []).filter((subscription) => subscription.plan_id === plan.id && subscription.status === 'active').length,
    eligibleServiceIds: (plan.subscription_plan_services ?? []).map((row: { service_id: string }) => row.service_id),
  }))
  const date = new Intl.DateTimeFormat('ar-EG', { day: 'numeric', month: 'short', year: 'numeric' })

  return <div className="mx-auto max-w-6xl space-y-8">
    <header><p className="text-sm font-bold text-antique-gold">الإيراد المتكرر</p><h1 className="mt-1 text-3xl font-bold text-deep-teal">الباقات والاشتراكات</h1><p className="mt-2 max-w-3xl leading-loose text-text-soft">أنشئي أي عدد من الباقات، حددي السعر والمدة والمزايا والجلسات والسعة وفترة البيع، ثم أوقفي أو انشري كل باقة بشكل مستقل.</p></header>
    <MembershipPlansManager plans={plans} services={serviceRows ?? []} packageProducts={packageProducts ?? []} />
    <SubscriptionCreate plans={plans.map(plan=>({id:plan.id,title:plan.title}))} customers={customerProfiles.map(profile=>({id:profile.id,name:profile.full_name||'عميلة',email:profile.email}))} />
    <section className="space-y-4"><h2 className="font-heading text-2xl font-bold text-deep-teal">اشتراكات العميلات</h2>
      {!subscriptions?.length ? <EmptyState title="لا اشتراكات بعد" description="ستظهر الاشتراكات هنا عند تفعيل أول باقة لعميلة." /> : <Table><THead><tr><TH>العميلة</TH><TH>الباقة</TH><TH>الفترة</TH><TH>رصيد الجلسات</TH><TH>الحالة</TH></tr></THead><TBody>
        {subscriptions.map((subscription) => {
          const profile = profileMap.get(subscription.user_id)
          const plan = Array.isArray(subscription.subscription_plans) ? subscription.subscription_plans[0] : subscription.subscription_plans
          const balance=(subscription.subscription_credit_ledger??[]).reduce((sum,row)=>sum+row.delta,0)
          return <TR key={subscription.id}><TD><p className="font-semibold text-deep-teal">{profile?.full_name || 'عميلة'}</p><p className="text-xs text-taupe" dir="ltr">{profile?.email}</p></TD><TD>{plan?.title ?? '—'}</TD><TD>{date.format(new Date(subscription.starts_at))} — {date.format(new Date(subscription.ends_at))}</TD><TD><SubscriptionCreditControl id={subscription.id} balance={balance} included={plan?.sessions_included??0}/></TD><TD><SubscriptionStatusControl id={subscription.id} status={subscription.status} /></TD></TR>
        })}
      </TBody></Table>}
    </section>
  </div>
}
