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
    <label className="text-xs font-bold text-deep-teal">العنوان<input name="title" minLength={3} maxLength={160} defaultValue={article.title} className={input} required /></label>
    <label className="text-xs font-bold text-deep-teal">الرابط<input name="slug" minLength={3} maxLength={80} pattern="[a-z0-9]+(?:-[a-z0-9]+)*" defaultValue={article.slug} className={input} dir="ltr" required /></label>
    <label className="text-xs font-bold text-deep-teal">المقتطف<textarea name="excerpt" maxLength={500} defaultValue={article.excerpt} rows={2} className={input} /></label>
    <label className="text-xs font-bold text-deep-teal">المحتوى<textarea name="content" maxLength={100000} defaultValue={article.content} rows={10} className={input} /></label>
    <MediaPickerField assets={media} defaultValue={article.coverUrl} label="صورة غلاف المقال" />
    <label className="text-xs font-bold text-deep-teal">عنوان SEO<input name="seo_title" maxLength={70} defaultValue={article.seoTitle ?? ''} className={input} /></label>
    <label className="text-xs font-bold text-deep-teal">وصف SEO<textarea name="seo_description" maxLength={180} defaultValue={article.seoDescription ?? ''} rows={2} className={input} /></label>
    {message && <p className="text-xs font-semibold text-deep-teal" role={message.startsWith('حُفظ') || message.startsWith('أُرشف') ? 'status' : 'alert'} aria-live="polite">{message}</p>}
    <div className="flex flex-wrap gap-2"><Button type="submit" size="sm" disabled={busy}>{busy ? 'جاري الحفظ…' : 'حفظ التعديلات'}</Button>{!confirm ? <Button type="button" size="sm" variant="burgundy" disabled={busy} onClick={() => setConfirm(true)}>أرشفة</Button> : <><Button type="button" size="sm" variant="burgundy" disabled={busy} onClick={async () => { setBusy(true); const result = await deleteArticle(article.id); setMessage(result.ok ? 'أُرشف المقال مع حفظ تاريخه.' : result.error); setBusy(false) }}>تأكيد الأرشفة</Button><Button type="button" size="sm" variant="ghost" disabled={busy} onClick={() => setConfirm(false)}>تراجع</Button></>}</div>
  </form></details>
}
