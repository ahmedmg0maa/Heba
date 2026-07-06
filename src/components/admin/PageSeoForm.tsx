'use client'

import { useState } from 'react'
import { updatePageSeo } from '@/lib/actions/cms'
import { FormField } from '@/components/ui/FormField'
import { Button } from '@/components/ui/Button'

export function PageSeoForm({
  pageId,
  seoTitle,
  seoDescription,
}: {
  pageId: string
  seoTitle: string
  seoDescription: string
}) {
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault()
        setBusy(true)
        setMsg(null)
        const res = await updatePageSeo(pageId, new FormData(e.currentTarget))
        setMsg(res.ok ? 'حُفظ ✓' : res.error)
        setBusy(false)
      }}
      className="grid gap-3 border-t border-line pt-4 sm:grid-cols-[1fr_2fr_auto]"
    >
      <FormField label="عنوان SEO" name="seo_title" defaultValue={seoTitle} />
      <FormField label="وصف SEO" name="seo_description" defaultValue={seoDescription} />
      <div className="flex items-end gap-2 pb-0.5">
        <Button type="submit" size="sm" variant="secondary" disabled={busy}>
          حفظ
        </Button>
        {msg && <span className="pb-2 text-xs text-taupe">{msg}</span>}
      </div>
    </form>
  )
}
