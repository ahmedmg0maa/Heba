'use server'

import { revalidatePath } from 'next/cache'
import { getServerClient, getServiceClient, hasSupabaseServerSecret } from '@/lib/supabase/server'
import { hasSupabasePublicConfig } from '@/lib/supabase/public-key'

type ActionResult<T = null> = { ok: true; data: T } | { ok: false; error: string }

const NO_ENV = 'غير متاح في بيئة العرض التجريبية.'

const hasAuthEnv = hasSupabasePublicConfig
const hasGovernedMutationEnv = () => hasSupabasePublicConfig() && hasSupabaseServerSecret()

const controlCharacters = /[\u0000-\u001f\u007f]/
const phonePattern = /^\+?[0-9][0-9 ()-]{5,28}[0-9]$/

export async function updateProfile(formData: FormData): Promise<ActionResult> {
  if (!hasGovernedMutationEnv()) return { ok: false, error: NO_ENV }
  const supabase = await getServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'سجّلي دخولك أولًا.' }

  const rawFullName = String(formData.get('full_name') ?? '')
  const fullName = rawFullName.trim().replace(/\s+/g, ' ')
  const rawPhone = String(formData.get('phone') ?? '').trim()
  const phone = rawPhone || null
  if (fullName.length < 2 || fullName.length > 120 || controlCharacters.test(rawFullName)) {
    return { ok: false, error: 'الاسم يجب أن يكون بين حرفين و١٢٠ حرفًا.' }
  }
  if (phone && (!phonePattern.test(phone) || controlCharacters.test(phone))) {
    return { ok: false, error: 'أدخلي رقم هاتف صحيحًا من ٧ إلى ٣٠ رمزًا.' }
  }

  const { data, error } = await getServiceClient().rpc('update_customer_profile', {
    p_actor_id: user.id,
    p_full_name: fullName,
    p_phone: phone,
  })
  if (error) return { ok: false, error: 'تعذّر الحفظ — حاولي مرة أخرى.' }
  revalidatePath('/dashboard/profile')
  revalidatePath('/dashboard')
  if (!data?.outcome) return { ok: false, error: 'تعذّر تأكيد حفظ البيانات.' }
  return { ok: true, data: null }
}

export async function markNotificationsRead(): Promise<ActionResult<{ count: number }>> {
  if (!hasGovernedMutationEnv()) return { ok: false, error: NO_ENV }
  const supabase = await getServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'سجّلي دخولك أولًا.' }

  const { data, error } = await getServiceClient().rpc('mark_customer_notifications_read', {
    p_actor_id: user.id,
  })
  if (error) return { ok: false, error: 'تعذّر التحديث.' }
  revalidatePath('/dashboard/notifications')
  revalidatePath('/dashboard')
  return { ok: true, data: { count: Number(data?.count ?? 0) } }
}

export async function changePassword(formData: FormData): Promise<ActionResult> {
  if (!hasAuthEnv()) return { ok: false, error: NO_ENV }
  const supabase = await getServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'سجّلي دخولك أولًا.' }

  const password = String(formData.get('password') ?? '')
  if (password.length < 8) return { ok: false, error: 'كلمة المرور يجب ألا تقل عن ٨ أحرف.' }
  const { error } = await supabase.auth.updateUser({ password })
  if (error) return { ok: false, error: 'تعذّر تغيير كلمة المرور — حاولي مرة أخرى.' }
  return { ok: true, data: null }
}
