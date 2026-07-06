'use client'

import { useState } from 'react'
import { updateProfile, changePassword } from '@/lib/actions/account'
import { FormField } from '@/components/ui/FormField'
import { Button } from '@/components/ui/Button'
import type { MyProfile } from '@/lib/data/dashboard'

function Feedback({ state }: { state: { ok: boolean; msg: string } | null }) {
  if (!state) return null
  return (
    <p
      role={state.ok ? 'status' : 'alert'}
      className={
        state.ok
          ? 'rounded-xl bg-deep-teal/8 px-4 py-3 text-sm font-medium text-deep-teal'
          : 'rounded-xl bg-burgundy/10 px-4 py-3 text-sm font-medium text-burgundy'
      }
    >
      {state.msg}
    </p>
  )
}

export function ProfileForm({ profile }: { profile: MyProfile | null }) {
  const [state, setState] = useState<{ ok: boolean; msg: string } | null>(null)
  const [busy, setBusy] = useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setBusy(true)
    const res = await updateProfile(new FormData(e.currentTarget))
    setState(res.ok ? { ok: true, msg: 'تم حفظ بياناتك بنجاح.' } : { ok: false, msg: res.error })
    setBusy(false)
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <FormField label="الاسم الكامل" name="full_name" defaultValue={profile?.fullName ?? ''} required />
      <FormField label="البريد الإلكتروني" name="email" defaultValue={profile?.email ?? ''} disabled dir="ltr" hint="البريد مرتبط بحسابك ولا يمكن تغييره من هنا" />
      <FormField label="رقم الهاتف" name="phone" type="tel" defaultValue={profile?.phone ?? ''} dir="ltr" />
      <Feedback state={state} />
      <Button type="submit" disabled={busy}>
        {busy ? 'جارٍ الحفظ…' : 'حفظ التغييرات'}
      </Button>
    </form>
  )
}

export function PasswordForm() {
  const [state, setState] = useState<{ ok: boolean; msg: string } | null>(null)
  const [busy, setBusy] = useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    setBusy(true)
    const res = await changePassword(new FormData(form))
    setState(res.ok ? { ok: true, msg: 'تم تغيير كلمة المرور بنجاح.' } : { ok: false, msg: res.error })
    if (res.ok) form.reset()
    setBusy(false)
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <FormField
        label="كلمة المرور الجديدة"
        name="password"
        type="password"
        autoComplete="new-password"
        hint="٨ أحرف على الأقل"
        required
        dir="ltr"
      />
      <Feedback state={state} />
      <Button type="submit" variant="secondary" disabled={busy}>
        {busy ? 'لحظات…' : 'تغيير كلمة المرور'}
      </Button>
    </form>
  )
}
