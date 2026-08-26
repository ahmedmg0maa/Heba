'use server'

import { revalidatePath } from 'next/cache'
import { getServerClient } from '@/lib/supabase/server'
import { hasSupabasePublicConfig } from '@/lib/supabase/public-key'

type ActionResult = { ok: true } | { ok: false; error: string }

const NO_ENV = 'غير متاح في بيئة العرض التجريبية.'

const hasEnv = hasSupabasePublicConfig

export async function updateProfile(formData: FormData): Promise<ActionResult> {
  if (!hasEnv()) return { ok: false, error: NO_ENV }
  const supabase = await getServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'سجّلي دخولك أولًا.' }

  const fullName = String(formData.get('full_name') ?? '').trim()
  const phone = String(formData.get('phone') ?? '').trim() || null
  if (fullName.length < 2) return { ok: false, error: 'أدخلي اسمًا صحيحًا.' }

  const { error } = await supabase.from('profiles').update({ full_name: fullName, phone }).eq('id', user.id)
  if (error) return { ok: false, error: 'تعذّر الحفظ — حاولي مرة أخرى.' }
  revalidatePath('/dashboard/profile')
  return { ok: true }
}

export async function markNotificationsRead(): Promise<ActionResult> {
  if (!hasEnv()) return { ok: false, error: NO_ENV }
  const supabase = await getServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'سجّلي دخولك أولًا.' }

  const { error } = await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('user_id', user.id)
    .is('read_at', null)
  if (error) return { ok: false, error: 'تعذّر التحديث.' }
  revalidatePath('/dashboard/notifications')
  return { ok: true }
}

export async function changePassword(formData: FormData): Promise<ActionResult> {
  if (!hasEnv()) return { ok: false, error: NO_ENV }
  const supabase = await getServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'سجّلي دخولك أولًا.' }

  const password = String(formData.get('password') ?? '')
  if (password.length < 8) return { ok: false, error: 'كلمة المرور يجب ألا تقل عن ٨ أحرف.' }
  const { error } = await supabase.auth.updateUser({ password })
  if (error) return { ok: false, error: 'تعذّر تغيير كلمة المرور — حاولي مرة أخرى.' }
  return { ok: true }
}
