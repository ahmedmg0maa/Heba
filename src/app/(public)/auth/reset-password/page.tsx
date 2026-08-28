'use client'

import { useState } from 'react'
import { getBrowserClient } from '@/lib/supabase/client'
import { AuthShell, AuthLink } from '@/components/auth/AuthShell'
import { FormField } from '@/components/ui/FormField'
import { Button } from '@/components/ui/Button'

export default function ResetPasswordPage() {
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const form = new FormData(e.currentTarget)
    await getBrowserClient().auth.resetPasswordForEmail(String(form.get('email')), {
      redirectTo: `${window.location.origin}/auth/callback?next=/auth/update-password`,
    })
    // Always show success — never reveal whether an email is registered.
    setDone(true)
  }

  return (
    <AuthShell
      title="استعادة كلمة المرور"
      lead="أدخلي بريدك وسنرسل لك رابط إعادة التعيين."
      footer={
        <>
          تذكرتِ كلمة المرور؟ <AuthLink href="/auth/login">سجّلي دخولك</AuthLink>
        </>
      }
    >
      {done ? (
        <div className="space-y-3 text-center">
          <h2 className="text-xl font-bold text-deep-teal">تحققي من بريدك</h2>
          <p className="leading-relaxed text-text-soft">
            إذا كان البريد مسجّلًا ومزوّد البريد مهيّأ، تُرسل خدمة المصادقة رسالة برابط إعادة التعيين. لا نعرض مدة تسليم ثابتة.
          </p>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-5">
          <FormField label="البريد الإلكتروني" name="email" type="email" autoComplete="email" required dir="ltr" />
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'جارٍ الإرسال…' : 'إرسال رابط الاستعادة'}
          </Button>
        </form>
      )}
    </AuthShell>
  )
}
