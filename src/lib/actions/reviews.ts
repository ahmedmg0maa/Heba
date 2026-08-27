'use server'

import { revalidatePath } from 'next/cache'
import { getServerClient, getServiceClient, hasSupabaseServerSecret } from '@/lib/supabase/server'
import { hasSupabasePublicConfig } from '@/lib/supabase/public-key'
import { requirePermission } from '@/lib/auth/permissions'
import { normalizeReviewSubmission } from '@/lib/reviews/governance'

type Result = { ok: true } | { ok: false; error: string }
export type ReviewModerationAction = 'approve' | 'reject' | 'archive' | 'restore' | 'feature' | 'unfeature' | 'respond'

export async function submitProductReview(
  productId: string,
  rating: number,
  comment: string,
  displayNameConsent: boolean,
  publicationConsent: boolean,
): Promise<Result> {
  if (!hasSupabasePublicConfig()) return { ok: false, error: 'إرسال التقييم غير مهيّأ في هذه البيئة.' }
  const normalized = normalizeReviewSubmission({ productId, rating, comment, displayNameConsent, publicationConsent })
  if (!normalized.ok) return { ok: false, error: normalized.error }
  const supabase = await getServerClient()
  const { error } = await supabase.rpc('submit_verified_review', {
    p_product_id: normalized.value.productId,
    p_rating: normalized.value.rating,
    p_comment: normalized.value.comment,
    p_display_name_consent: normalized.value.displayNameConsent,
    p_publication_consent: normalized.value.publicationConsent,
  })
  if (error) return { ok: false, error: error.message.includes('purchase_required') ? 'التقييم متاح للمشتريات الفعلية المدفوعة فقط.' : 'تعذّر حفظ التقييم.' }
  revalidatePath('/dashboard/orders')
  return { ok: true }
}

export async function moderateReview(
  reviewId: string,
  action: ReviewModerationAction,
  reason: string,
  ownerResponse: string,
  publishResponse: boolean,
): Promise<Result> {
  if (!hasSupabasePublicConfig() || !hasSupabaseServerSecret()) return { ok: false, error: 'إدارة التقييمات غير مهيّأة في هذه البيئة.' }
  const admin = await requirePermission('reviews.manage')
  if (!admin?.userId) return { ok: false, error: 'لا تملكين صلاحية مراجعة التقييمات.' }
  if (!['approve', 'reject', 'archive', 'restore', 'feature', 'unfeature', 'respond'].includes(action)) return { ok: false, error: 'إجراء مراجعة غير صالح.' }
  if (action === 'reject' && reason.trim().length < 3) return { ok: false, error: 'اكتبي سبب الرفض الداخلي.' }
  if (reason.trim().length > 500 || ownerResponse.trim().length > 2000) return { ok: false, error: 'النص أطول من الحد المسموح.' }

  const { error } = await getServiceClient().rpc('manage_review', {
    p_review_id: reviewId,
    p_actor_id: admin.userId,
    p_action: action,
    p_reason: reason.trim() || null,
    p_owner_response: ownerResponse.trim() || null,
    p_publish_response: Boolean(ownerResponse.trim()) && publishResponse,
  })
  if (error) {
    if (error.message.includes('review_publication_evidence_required')) return { ok: false, error: 'لا يمكن النشر دون تحقق شراء وموافقة صريحة على نشر التجربة.' }
    if (error.message.includes('approved_review_required')) return { ok: false, error: 'هذا الإجراء متاح للتقييم المعتمد فقط.' }
    return { ok: false, error: 'تعذّر حفظ قرار المراجعة.' }
  }
  for (const path of ['/admin/reviews', '/testimonials', '/', '/courses']) revalidatePath(path)
  return { ok: true }
}
