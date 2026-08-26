'use client'

import { useState } from 'react'
import { deleteArticle, saveArticle } from '@/lib/actions/admin-control'
import { Button } from '@/components/ui/Button'
import { MediaPickerField } from '@/components/admin/MediaPickerField'
import type { MediaOption } from '@/lib/data/cms'

export type ArticleAdminItem = { id: string; title: string; slug: string; excerpt: string; content: string; coverUrl: string | null; seoTitle: string | null; seoDescription: string | null }

export function ArticleEditor({ article, media = [] }: { article: ArticleAdminItem; media?: MediaOption[] }) {
  const [busy, setBusy] = useState(false); const [message, setMessage] = useState<string | null>(null); const [confirm, setConfirm] = useState(false)
  const input = 'w-full rounded-xl border border-line bg-surface-raised px-4 py-2.5 text-ink focus:border-deep-teal focus:outline-2 focus:outline-deep-teal/15'
  return <details className="min-w-72 rounded-xl border border-line bg-ivory/40"><summary className="cursor-pointer list-none px-4 py-2 text-sm font-bold text-deep-teal">تحرير المقال</summary><form className="grid gap-3 border-t border-line p-4" onSubmit={async (event) => { event.preventDefault(); setBusy(true); const result = await saveArticle(article.id, new FormData(event.currentTarget)); setMessage(result.ok ? 'حُفظت التعديلات مع نسخة مراجعة.' : result.error); setBusy(false) }}>
    <label className="text-xs font-bold text-deep-teal">العنوان<input name="title" defaultValue={article.title} className={input} required /></label>
    <label className="text-xs font-bold text-deep-teal">الرابط<input name="slug" defaultValue={article.slug} className={input} dir="ltr" required /></label>
    <label className="text-xs font-bold text-deep-teal">المقتطف<textarea name="excerpt" defaultValue={article.excerpt} rows={2} className={input} /></label>
    <label className="text-xs font-bold text-deep-teal">المحتوى<textarea name="content" defaultValue={article.content} rows={10} className={input} /></label>
    <MediaPickerField assets={media} defaultValue={article.coverUrl} label="صورة غلاف المقال" />
    <label className="text-xs font-bold text-deep-teal">عنوان SEO<input name="seo_title" defaultValue={article.seoTitle ?? ''} className={input} /></label>
    <label className="text-xs font-bold text-deep-teal">وصف SEO<textarea name="seo_description" defaultValue={article.seoDescription ?? ''} rows={2} className={input} /></label>
    {message && <p className="text-xs font-semibold text-deep-teal" role="status">{message}</p>}
    <div className="flex flex-wrap gap-2"><Button type="submit" size="sm" disabled={busy}>{busy ? 'جاري الحفظ…' : 'حفظ التعديلات'}</Button>{!confirm ? <Button type="button" size="sm" variant="burgundy" onClick={() => setConfirm(true)}>حذف</Button> : <><Button type="button" size="sm" variant="burgundy" onClick={async () => { setBusy(true); const result = await deleteArticle(article.id); setMessage(result.ok ? 'حُذف المقال.' : result.error); setBusy(false) }}>تأكيد الحذف</Button><Button type="button" size="sm" variant="ghost" onClick={() => setConfirm(false)}>تراجع</Button></>}</div>
  </form></details>
}
