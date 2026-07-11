'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getBrowserClient } from '@/lib/supabase/client'
import { AuthShell, AuthLink } from '@/components/auth/AuthShell'
import { PasswordField } from '@/components/auth/PasswordField'
import { FormField } from '@/components/ui/FormField'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/cn'

type Mode = 'magic' | 'password'

function LoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const [mode, setMode] = useState<Mode>('magic')
  const [error, setError] = useState<string | null>(
    params.get('error') === 'link' ? 'انتهت صلاحية الرابط أو استُخدم من قبل — أرسلي رابطًا جديدًا.' : null,
  )
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const redirect = params.get('redirect') ?? '/dashboard'

  async function onMagicSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const email = String(new FormData(e.currentTarget).get('email'))
    const { error } = await getBrowserClient().auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/confirm?next=${encodeURIComponent(redirect)}`,
      },
    })
    if (error) setError('تعذّر إرسال الرابط — تأكدي من البريد وحاولي مجددًا.')
    else setSent(true)
    setLoading(false)
  }

  async function onPasswordSubmit(e: React.FormEvent<HTMLFormElement>) {
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
    router.push(redirect)
    router.refresh()
  }

  if (sent) {
    return (
      <div className="space-y-4 text-center">
        <svg viewBox="0 0 48 48" className="mx-auto h-14 w-14 text-deep-teal" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
          <rect x="6" y="12" width="36" height="26" rx="4" strokeOpacity="0.4" />
          <path d="M8 15l16 12 16-12" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <h2 className="text-xl font-bold text-deep-teal">افتحي بريدك الإلكتروني</h2>
        <p className="leading-relaxed text-text-soft">
          أرسلنا لك رابط دخول فوري — اضغطي عليه من هاتفك أو جهازك وستدخلين مباشرة، بلا كلمة مرور.
        </p>
        <button type="button" onClick={() => setSent(false)} className="text-sm font-semibold text-burgundy underline-offset-4 hover:underline">
          لم يصلك؟ أعيدي الإرسال
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* mode switch */}
      <div className="flex rounded-full border border-line bg-ivory/60 p-1" role="tablist" aria-label="طريقة الدخول">
        {(
          [
            { id: 'magic', label: '✨ رابط سريع' },
            { id: 'password', label: 'كلمة المرور' },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={mode === t.id}
            onClick={() => {
              setMode(t.id)
              setError(null)
            }}
            className={cn(
              'min-h-10 flex-1 touch-manipulation rounded-full text-sm font-semibold transition-all',
              mode === t.id ? 'bg-deep-teal text-soft-white shadow-card' : 'text-taupe hover:text-deep-teal',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {mode === 'magic' ? (
        <form onSubmit={onMagicSubmit} className="space-y-5">
          <FormField
            label="البريد الإلكتروني"
            name="email"
            type="email"
            autoComplete="email"
            required
            dir="ltr"
            hint="يصلك رابط تضغطين عليه فتدخلين فورًا — الطريقة الأسهل"
          />
          {error && (
            <p className="rounded-xl bg-burgundy/10 px-4 py-3 text-sm font-medium text-burgundy" role="alert">
              {error}
            </p>
          )}
          <Button type="submit" disabled={loading} className="shimmer w-full">
            {loading ? 'جارٍ الإرسال…' : 'أرسلي لي رابط الدخول'}
          </Button>
        </form>
      ) : (
        <form onSubmit={onPasswordSubmit} className="space-y-5">
          <FormField label="البريد الإلكتروني" name="email" type="email" autoComplete="email" required dir="ltr" />
          <PasswordField label="كلمة المرور" name="password" autoComplete="current-password" />
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
      )}
    </div>
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
