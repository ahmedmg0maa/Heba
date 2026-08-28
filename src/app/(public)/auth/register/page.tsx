'use client'

import { useState } from 'react'
import { getBrowserClient } from '@/lib/supabase/client'
import { AuthShell, AuthLink } from '@/components/auth/AuthShell'
import { PasswordField } from '@/components/auth/PasswordField'
import { FormField } from '@/components/ui/FormField'
import { Button } from '@/components/ui/Button'
import { PASSWORD_HINT, PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH, validateNewPassword } from '@/lib/auth/password-policy'

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const form = new FormData(e.currentTarget)
    const password = String(form.get('password'))
    const passwordError = validateNewPassword(password, password)
    if (passwordError) {
      setError(passwordError)
      setLoading(false)
      return
    }
    const { error } = await getBrowserClient().auth.signUp({
      email: String(form.get('email')),
      password,
      options: {
        data: { full_name: String(form.get('full_name')) },
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
      },
    })
    if (error) {
      setError('تعذّر إنشاء الحساب. ربما البريد مستخدم من قبل — جرّبي تسجيل الدخول.')
      setLoading(false)
      return
    }
    setDone(true)
  }

  return (
    <AuthShell
      title="أنشئي حسابك"
      lead="خطوة واحدة تفصلك عن مكتبتك ودوراتك."
      footer={
        <>
          لديك حساب بالفعل؟ <AuthLink href="/auth/login">سجّلي دخولك</AuthLink>
        </>
      }
    >
      {done ? (
        <div className="space-y-3 text-center">
          <h2 className="text-xl font-bold text-deep-teal">تحققي من بريدك الإلكتروني</h2>
          <p className="leading-relaxed text-text-soft">
            أرسلنا لك رابط تفعيل الحساب. افتحي الرسالة واضغطي على الرابط لإكمال التسجيل.
          </p>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-5">
          <FormField label="الاسم الكامل" name="full_name" autoComplete="name" required />
          <FormField label="البريد الإلكتروني" name="email" type="email" autoComplete="email" required dir="ltr" />
          <PasswordField
            label="كلمة المرور"
            name="password"
            autoComplete="new-password"
            hint={PASSWORD_HINT}
            minLength={PASSWORD_MIN_LENGTH}
            maxLength={PASSWORD_MAX_LENGTH}
          />
          {error && (
            <p className="rounded-xl bg-burgundy/10 px-4 py-3 text-sm font-medium text-burgundy" role="alert">
              {error}
            </p>
          )}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'جارٍ الإنشاء…' : 'إنشاء الحساب'}
          </Button>
        </form>
      )}
    </AuthShell>
  )
}
