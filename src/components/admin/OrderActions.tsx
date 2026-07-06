'use client'

import { useState } from 'react'
import { updateOrderStatus } from '@/lib/actions/admin'
import { Button } from '@/components/ui/Button'

export function OrderActions({ orderId, status }: { orderId: string; status: string }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function act(target: 'cancelled' | 'refunded' | 'expired') {
    setBusy(true)
    setError(null)
    const res = await updateOrderStatus(orderId, target)
    if (!res.ok) setError(res.error)
    setBusy(false)
  }

  const canCancel = status === 'pending_payment' || status === 'awaiting_review'
  const canRefund = status === 'paid'
  if (!canCancel && !canRefund) return <span className="text-xs text-taupe">—</span>

  return (
    <div className="space-y-1">
      <div className="flex gap-2">
        {canCancel && (
          <Button variant="secondary" size="sm" disabled={busy} onClick={() => act('cancelled')}>
            إلغاء
          </Button>
        )}
        {canRefund && (
          <Button variant="burgundy" size="sm" disabled={busy} onClick={() => act('refunded')}>
            استرداد
          </Button>
        )}
      </div>
      {error && (
        <p className="text-xs font-medium text-burgundy" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
