'use client'

import { useState } from 'react'
import { setRolePermissions } from '@/lib/actions/cms'
import { Button } from '@/components/ui/Button'

export function RolePermissionEditor({ role, allPermissions, selected }: { role: string; allPermissions: string[]; selected: string[] }) {
  const [busy,setBusy]=useState(false); const [message,setMessage]=useState<string|null>(null)
  return <details className="mt-4 rounded-xl border border-line bg-ivory/35"><summary className="cursor-pointer list-none px-3 py-2 text-sm font-bold text-deep-teal">تعديل صلاحيات الدور</summary><form className="border-t border-line p-3" onSubmit={async(event)=>{event.preventDefault();setBusy(true);const form=new FormData(event.currentTarget);const result=await setRolePermissions(role,form.getAll('permission').map(String));setMessage(result.ok?'حُفظت الصلاحيات وأصبحت فعالة.':result.error);setBusy(false)}}><div className="grid max-h-72 gap-2 overflow-y-auto sm:grid-cols-2">{allPermissions.map(permission=><label key={permission} className="flex items-center gap-2 rounded-lg bg-surface-raised px-2 py-1.5 text-xs" dir="ltr"><input type="checkbox" name="permission" value={permission} defaultChecked={selected.includes(permission)} disabled={permission==='admin.access'} className="accent-deep-teal"/>{permission}{permission==='admin.access'&&<input type="hidden" name="permission" value={permission}/>}</label>)}</div>{message&&<p role="status" className="mt-3 text-xs font-semibold text-deep-teal">{message}</p>}<Button type="submit" size="sm" disabled={busy} className="mt-3">{busy?'جارٍ الحفظ…':'حفظ المصفوفة'}</Button></form></details>
}
