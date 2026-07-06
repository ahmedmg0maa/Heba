'use client'

import { useState } from 'react'
import { markNotificationsRead } from '@/lib/actions/account'
import { Button } from '@/components/ui/Button'

export function MarkReadButton() {
  const [busy, setBusy] = useState(false)

  return (
    <Button
      variant="secondary"
      size="sm"
      disabled={busy}
      onClick={async () => {
        setBusy(true)
        await markNotificationsRead()
        setBusy(false)
      }}
    >
      {busy ? 'لحظات…' : 'تحديد الكل كمقروء'}
    </Button>
  )
}
