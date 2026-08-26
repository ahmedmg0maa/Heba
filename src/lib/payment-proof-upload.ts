'use client'

import { beginPaymentProofUpload, finalizePaymentProofUpload } from '@/lib/actions/checkout'
import { getBrowserClient } from '@/lib/supabase/client'

type Method = 'instapay' | 'wallet' | 'bank_transfer'
type Result = { ok: true; data: { paymentId: string } } | { ok: false; error: string }

export async function uploadPaymentProofDirect(orderId: string, method: Method, file: File): Promise<Result> {
  const started = await beginPaymentProofUpload({ orderId, method, name: file.name, type: file.type, size: file.size })
  if (!started.ok) return started
  const upload = await getBrowserClient().storage.from(started.data.bucket).uploadToSignedUrl(started.data.path, started.data.token, file, { contentType: file.type })
  if (upload.error) return { ok: false, error: 'تعذّر رفع الإيصال بأمان. حاولي مرة أخرى.' }
  return finalizePaymentProofUpload({ orderId, method, path: started.data.path })
}
