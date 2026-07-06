'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getBrowserClient } from '@/lib/supabase/client'
import { AuthShell, AuthLink } from '@/components/auth/AuthShell'
import { FormField } from '@/components/ui/FormField'
import { Button } from '@/components/ui/Button'

function LoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const form = new FormData(e.currentTarget)
    const { error } = await getBrowserClient().auth.signInWithPassword({
      email: String(form.get('email')),
      password: String(form.get('password')),
    })
    if (error) {
      setError('البريد الإلكتروني أو كلمة المرور غير صحيحة.')
      setLoading(false)
      return
    }
    router.push(params.get('redirect') ?? '/dashboard')
    router.refresh()
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <FormField label="البريد الإلكتروني" name="email" type="email" autoComplete="email" required dir="ltr" />
      <FormField label="كلمة المرور" name="password" type="password" autoComplete="current-password" required dir="ltr" />
      {error && (
        <p className="rounded-xl bg-burgundy/10 px-4 py-3 text-sm font-medium text-burgundy" role="alert">
          {error}
        </p>
      )}
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'جارٍ الدخول…' : 'تسجيل الدخول'}
      </Button>
      <p className="text-center text-sm">
        <AuthLink href="/auth/reset-password">نسيتِ كلمة المرور؟</AuthLink>
      </p>
    </form>
  )
}

export default function LoginPage() {
  return (
    <AuthShell
      title="أهلًا بعودتك"
      lead="سجّلي دخولك لمتابعة رحلتك التعليمية."
      footer={
        <>
          ليس لديك حساب؟ <AuthLink href="/auth/register">أنشئي حسابك</AuthLink>
        </>
      }
    >
      <Suspense>
        <LoginForm />
      </Suspense>
    </AuthShell>
  )
}
