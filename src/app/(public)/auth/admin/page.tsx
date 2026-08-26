'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { AuthShell } from '@/components/auth/AuthShell'
import { PasswordField } from '@/components/auth/PasswordField'
import { Button } from '@/components/ui/Button'
import { adminPasswordLogin } from '@/lib/actions/auth'

function AdminLoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const [error, setError] = useState<string | null>(params.get('error') === 'role' ? 'هذا الحساب لا يملك صلاحية إدارية.' : null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError(null)
    const form = new FormData(event.currentTarget)
    const result = await adminPasswordLogin(String(form.get('password')))
    if (!result.ok) {
      setError(result.error)
      setLoading(false)
      return
    }

    const requested = params.get('redirect')
    const target = requested?.startsWith('/admin') ? requested : '/admin/overview'
    router.replace(result.needsMfa ? `/auth/admin/mfa?redirect=${encodeURIComponent(target)}` : target)
    router.refresh()
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="rounded-2xl border border-antique-gold/30 bg-antique-gold/5 px-4 py-3 text-sm text-text-soft">
        بوابة الإدارة الخاصة. أدخلي كلمة مرور الإدارة فقط؛ هوية الحساب محفوظة بأمان على الخادم.
      </div>
      <PasswordField label="كلمة مرور الإدارة" name="password" autoComplete="current-password" />
      {error && <p className="rounded-xl bg-burgundy/10 px-4 py-3 text-sm font-medium text-burgundy" role="alert">{error}</p>}
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'جارٍ التحقق…' : 'دخول لوحة الإدارة'}
      </Button>
    </form>
  )
}

export default function AdminLoginPage() {
  return (
    <AuthShell title="دخول الإدارة" lead="مساحة تشغيل محمية للمشرفين فقط.">
      <Suspense><AdminLoginForm /></Suspense>
    </AuthShell>
  )
}
