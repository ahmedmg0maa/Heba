'use client'

import { useState } from 'react'
import { deleteProductRecord, deleteProductVariant, saveBundleChildren, saveProductRecord, saveProductVariant, setProgramProductPublication } from '@/lib/actions/admin-control'
import { Button } from '@/components/ui/Button'
import { MediaPickerField } from '@/components/admin/MediaPickerField'
import type { MediaOption } from '@/lib/data/cms'

export type ProductAdminItem = { id: string; type: string; title: string; slug: string; subtitle: string | null; description: string; price: number; compareAtPrice: number | null; currency: string; coverUrl: string | null; isPublished: boolean; sort: number }
export type ProductVariantItem = { id: string; name: string; price: number; isActive: boolean }
export type BundleChildOption = { id: string; title: string; type: string }
const input = 'min-h-10 w-full rounded-xl border border-line bg-surface-raised px-3 py-2 text-sm text-ink'

function ProductForm({ item, media = [] }: { item?: ProductAdminItem; media?: MediaOption[] }) {
  const [busy,setBusy]=useState(false); const [message,setMessage]=useState<string|null>(null); const [confirm,setConfirm]=useState(false)
  return <form className="grid gap-3 md:grid-cols-2" onSubmit={async(event)=>{event.preventDefault();setBusy(true);const result=await saveProductRecord(item?.id??null,new FormData(event.currentTarget));setMessage(result.ok?'تم حفظ المنتج.':result.error);setBusy(false);if(result.ok&&!item)event.currentTarget.reset()}}>
    <label className="text-xs font-bold text-deep-teal">النوع<select name="type" defaultValue={item?.type??'bundle'} disabled={Boolean(item)} className={input}><option value="bundle">حزمة</option><option value="vip">VIP</option><option value="free_resource">مورد مجاني</option>{item && !['bundle','vip','free_resource'].includes(item.type) && <option value={item.type}>{item.type}</option>}</select>{item&&<input type="hidden" name="type" value={item.type}/>}</label>
    <label className="text-xs font-bold text-deep-teal">العنوان<input name="title" defaultValue={item?.title} className={input} required/></label>
    <label className="text-xs font-bold text-deep-teal">الرابط<input name="slug" defaultValue={item?.slug} className={input} dir="ltr" required/></label>
    <label className="text-xs font-bold text-deep-teal">العنوان الفرعي<input name="subtitle" defaultValue={item?.subtitle??''} className={input}/></label>
    <label className="text-xs font-bold text-deep-teal">السعر<input name="price" type="number" min="0" step="0.01" defaultValue={item?.price??0} className={input} required/></label>
    <label className="text-xs font-bold text-deep-teal">قبل الخصم<input name="compare_at_price" type="number" min="0" step="0.01" defaultValue={item?.compareAtPrice??''} className={input}/></label>
    <label className="text-xs font-bold text-deep-teal">العملة<input name="currency" defaultValue={item?.currency??'EGP'} className={input} dir="ltr"/></label>
    <label className="text-xs font-bold text-deep-teal">الترتيب<input name="sort" type="number" defaultValue={item?.sort??0} className={input}/></label>
    <MediaPickerField assets={media} defaultValue={item?.coverUrl} label="غلاف المنتج" />
    <label className="text-xs font-bold text-deep-teal md:col-span-2">الوصف<textarea name="description" defaultValue={item?.description} rows={3} className={input}/></label>
    <p className="rounded-xl bg-ivory/70 p-3 text-xs leading-relaxed text-text-soft md:col-span-2">الحفظ يعيد البرنامج إلى مسودة لحماية السعر والتكوين. استخدمي زر النشر المستقل بعد اكتمال الحزمة أو ربط VIP أو المورد المجاني.</p>
    {message&&<p className="text-xs font-semibold text-deep-teal md:col-span-2" role="status">{message}</p>}
    <div className="flex flex-wrap gap-2 md:col-span-2"><Button type="submit" size="sm" disabled={busy}>{busy?'جاري الحفظ…':item?'حفظ المنتج':'إنشاء المنتج'}</Button>{item&&(!confirm?<Button type="button" size="sm" variant="burgundy" onClick={()=>setConfirm(true)}>حذف</Button>:<><Button type="button" size="sm" variant="burgundy" onClick={async()=>{setBusy(true);const result=await deleteProductRecord(item.id);setMessage(result.ok?'حُذف المنتج.':result.error);setBusy(false)}}>تأكيد الحذف</Button><Button type="button" size="sm" variant="ghost" onClick={()=>setConfirm(false)}>تراجع</Button></>)}</div>
  </form>
}

export function ProductCreatePanel({media=[]}:{media?:MediaOption[]}){return <details className="rounded-2xl border border-antique-gold/30 bg-surface-raised shadow-card"><summary className="cursor-pointer list-none px-6 py-5 font-heading text-xl font-bold text-deep-teal">إضافة حزمة أو منتج VIP أو مورد مجاني</summary><div className="border-t border-line p-6"><ProductForm media={media}/></div></details>}
export function ProductEditPanel({item,media=[]}:{item:ProductAdminItem;media?:MediaOption[]}){return <details className="min-w-64 rounded-xl border border-line bg-ivory/40"><summary className="cursor-pointer list-none px-4 py-2 text-sm font-bold text-deep-teal">تعديل كامل</summary><div className="border-t border-line p-4"><ProductForm item={item} media={media}/></div></details>}

export function ProgramPublishControl({ productId, published }: { productId: string; published: boolean }) { const [busy,setBusy]=useState(false),[message,setMessage]=useState<string|null>(null);return <div className="min-w-36"><Button type="button" size="sm" variant={published?'secondary':'primary'} disabled={busy} onClick={async()=>{setBusy(true);const result=await setProgramProductPublication(productId,!published);setMessage(result.ok?(published?'أُخفي البرنامج.':'نُشر البرنامج بعد فحص الجاهزية.'):result.error);setBusy(false)}}>{published?'إخفاء':'فحص ونشر'}</Button>{message&&<p role="status" className="mt-1 max-w-64 text-xs font-semibold text-deep-teal">{message}</p>}</div> }

export function ProductComposition({ productId, productType, variants, options, selectedChildren }: { productId: string; productType: string; variants: ProductVariantItem[]; options: BundleChildOption[]; selectedChildren: string[] }) {
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  return <details className="min-w-64 rounded-xl border border-line bg-ivory/40"><summary className="cursor-pointer list-none px-4 py-2 text-sm font-bold text-deep-teal">الأسعار ومحتوى الحزمة</summary><div className="space-y-5 border-t border-line p-4">
    <section className="space-y-3"><h3 className="text-sm font-bold text-deep-teal">متغيرات السعر</h3>{variants.map((variant) => <form key={variant.id} className="grid gap-2 sm:grid-cols-[1fr_7rem_auto]" onSubmit={async (event) => { event.preventDefault(); setBusy(true); const result = await saveProductVariant(productId, variant.id, new FormData(event.currentTarget)); setMessage(result.ok ? 'حُفظ المتغير.' : result.error); setBusy(false) }}><input name="name" defaultValue={variant.name} className={input} aria-label="اسم المتغير" /><input name="price" type="number" min="0" step="0.01" defaultValue={variant.price} className={input} aria-label="سعر المتغير" /><div className="flex flex-wrap items-center gap-2"><label className="flex items-center gap-1 text-xs text-deep-teal"><input name="is_active" type="checkbox" defaultChecked={variant.isActive}/> نشط</label><Button type="submit" size="sm" disabled={busy}>حفظ</Button><Button type="button" size="sm" variant="burgundy" disabled={busy} onClick={async () => { setBusy(true); const result = await deleteProductVariant(productId, variant.id); setMessage(result.ok ? 'حُذف المتغير.' : result.error); setBusy(false) }}>حذف</Button></div></form>)}
      <form className="grid grid-cols-[1fr_7rem_auto] gap-2" onSubmit={async (event) => { event.preventDefault(); setBusy(true); const result = await saveProductVariant(productId, null, new FormData(event.currentTarget)); setMessage(result.ok ? 'أُضيف المتغير.' : result.error); setBusy(false); if (result.ok) event.currentTarget.reset() }}><input name="name" placeholder="مثال: نسخة مطبوعة" className={input} required /><input name="price" type="number" min="0" step="0.01" placeholder="السعر" className={input} required /><label className="sr-only"><input name="is_active" type="checkbox" defaultChecked /> نشط</label><Button type="submit" size="sm" disabled={busy}>إضافة</Button></form>
    </section>
    {productType === 'bundle' && <form className="space-y-3 border-t border-line pt-4" onSubmit={async (event) => { event.preventDefault(); setBusy(true); const result = await saveBundleChildren(productId, new FormData(event.currentTarget)); setMessage(result.ok ? 'حُفظ محتوى الحزمة.' : result.error); setBusy(false) }}><h3 className="text-sm font-bold text-deep-teal">المنتجات داخل الحزمة</h3><div className="grid max-h-52 gap-2 overflow-y-auto">{options.map((option) => <label key={option.id} className="flex items-center gap-2 rounded-lg bg-surface-raised px-3 py-2 text-xs text-ink"><input type="checkbox" name="children" value={option.id} defaultChecked={selectedChildren.includes(option.id)} /> <span>{option.title}</span><span className="ms-auto text-text-soft">{option.type}</span></label>)}</div><Button type="submit" size="sm" disabled={busy}>حفظ تكوين الحزمة</Button></form>}
    {message && <p role="status" className="text-xs font-semibold text-deep-teal">{message}</p>}
  </div></details>
}
