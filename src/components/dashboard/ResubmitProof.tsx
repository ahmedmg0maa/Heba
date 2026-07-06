'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { submitPaymentProof } from '@/lib/actions/checkout'
import { Button } from '@/components/ui/Button'

export function ResubmitProof({ orderId, method }: { orderId: string; method: string }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    const formData = new FormData(e.currentTarget)
    formData.set('orderId', orderId)
    formData.set('method', method)
    const res = await submitPaymentProof(formData)
    if (res.ok) {
      setDone(true)
      router.refresh()
    } else {
      setError(res.error)
    }
    setBusy(false)
  }

  if (done) {
    return (
      <p className="mt-4 rounded-xl bg-deep-teal/8 px-4 py-3 text-sm font-semibold text-deep-teal">
        استلمنا إيصالك الجديد — سيراجعه الفريق خلال ٢٤ ساعة كحد أقصى.
      </p>
    )
  }

  return (
    <form onSubmit={onSubmit} className="mt-4 space-y-3 rounded-xl border border-dashed border-antique-gold/60 bg-ivory/50 p-4">
      <label htmlFor={`reproof-${orderId}`} className="block text-sm font-bold text-deep-teal">
        رفع إيصال جديد
      </label>
      <input
        id={`reproof-${orderId}`}
        name="proof"
        type="file"
        accept="image/png,image/jpeg,image/webp"
        required
        className="w-full text-sm text-text-soft file:me-3 file:rounded-full file:border-0 file:bg-deep-teal file:px-4 file:py-1.5 file:text-xs file:font-semibold file:text-soft-white"
      />
      {error && (
        <p className="text-xs font-medium text-burgundy" role="alert">
          {error}
        </p>
      )}
      <Button type="submit" size="sm" disabled={busy}>
        {busy ? 'جارٍ الرفع…' : 'إرسال للمراجعة'}
      </Button>
    </form>
  )
}
