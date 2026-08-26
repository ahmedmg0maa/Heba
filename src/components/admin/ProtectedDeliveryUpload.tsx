'use client'

import { useState } from 'react'
import { beginProtectedUpload, finalizeProtectedUpload } from '@/lib/actions/delivery-admin'
import { getBrowserClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'

type Kind='book'|'lesson-video'|'lesson-resource'|'workshop-resource'|'workshop-recording'
export function ProtectedDeliveryUpload({kind,entityId,label}:{kind:Kind;entityId:string;label:string}){
  const[busy,setBusy]=useState(false),[message,setMessage]=useState<string|null>(null),[progress,setProgress]=useState('')
  return <form className="grid gap-2 rounded-xl border border-line bg-ivory/35 p-3" onSubmit={async(event)=>{event.preventDefault();const form=new FormData(event.currentTarget),file=form.get('file');if(!(file instanceof File)||!file.size)return;setBusy(true);setMessage(null);setProgress('تجهيز الرفع…');const start=await beginProtectedUpload(kind,entityId,{name:file.name,type:file.type,size:file.size});if(!start.ok){setMessage(start.error);setBusy(false);return}setProgress('جارٍ الرفع المباشر إلى التخزين…');const upload=await getBrowserClient().storage.from(start.data.bucket).uploadToSignedUrl(start.data.path,start.data.token,file,{contentType:file.type});if(upload.error){setMessage('تعذّر رفع الملف.');setBusy(false);return}setProgress('فحص الملف وربطه بالمحتوى…');const done=await finalizeProtectedUpload(kind,entityId,{path:start.data.path,title:String(form.get('title')||file.name),size:file.size,mime:file.type,format:String(form.get('version')||'1.0'),published:form.get('published')==='on'});setMessage(done.ok?'تم الرفع والفحص والربط بنجاح.':done.error);setProgress('');setBusy(false);if(done.ok)event.currentTarget.reset()}}>
    <p className="text-sm font-bold text-deep-teal">{label}</p><input name="title" placeholder="عنوان الملف" className="min-h-10 rounded-lg border border-line bg-surface-raised px-3 text-sm text-ink"/>{kind==='book'&&<input name="version" defaultValue="1.0" aria-label="رقم الإصدار" className="min-h-10 rounded-lg border border-line bg-surface-raised px-3 text-sm text-ink"/>}<input name="file" type="file" required className="text-xs text-text-soft" accept={kind==='book'?'.pdf,.epub':kind.includes('video')||kind==='workshop-recording'?'.mp4,.webm,.mov':'.pdf,.zip,.mp3,.wav,.m4a'}/>{kind==='workshop-recording'&&<label className="flex items-center gap-2 text-xs font-semibold text-deep-teal"><input type="checkbox" name="published" className="accent-deep-teal"/>نشر التسجيل للمسجلات فورًا</label>}<Button type="submit" size="sm" disabled={busy}>{busy?'جارٍ الرفع…':'رفع آمن مباشر'}</Button>{progress&&<p className="text-xs text-text-soft">{progress}</p>}{message&&<p role="status" className="text-xs font-semibold text-deep-teal">{message}</p>}
  </form>
}
