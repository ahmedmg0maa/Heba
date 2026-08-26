'use client'
import{useState}from'react'
import{createContentPreview}from'@/lib/actions/cms'
import{Button}from'@/components/ui/Button'
export function PreviewButton({type,id}:{type:'page'|'article';id:string}){const[busy,setBusy]=useState(false),[message,setMessage]=useState<string|null>(null);return <div><Button size="sm" variant="secondary" disabled={busy} onClick={async()=>{setBusy(true);const r=await createContentPreview(type,id);if(r.ok)window.open(r.url,'_blank','noopener,noreferrer');else setMessage(r.error);setBusy(false)}}>معاينة آمنة ٣٠ دقيقة</Button>{message&&<p className="text-xs text-deep-teal">{message}</p>}</div>}
