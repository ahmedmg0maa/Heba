'use server'

import { revalidatePath } from 'next/cache'
import { getServiceClient, hasSupabaseServerSecret } from '@/lib/supabase/server'
import { requirePermission } from '@/lib/auth/permissions'
import { hasSupabasePublicConfig } from '@/lib/supabase/public-key'

type ActionResult = { ok: true } | { ok: false; error: string }

const NO_ENV = 'غير متاح في بيئة العرض التجريبية.'
const NOT_ADMIN = 'هذه العملية تتطلب صلاحية إدارية.'
const GENERIC = 'حدث خطأ — حاولي مرة أخرى.'

const hasEnv = () => hasSupabasePublicConfig() && hasSupabaseServerSecret()

async function audit(actorId: string, action: string, entityType: string, entityId: string, meta: object) {
  await getServiceClient().from('audit_logs').insert({ actor_id: actorId, action, entity_type: entityType, entity_id: entityId, meta })
}

export async function createCoupon(formData: FormData): Promise<ActionResult> {
  if (!hasEnv()) return { ok: false, error: NO_ENV }
  const admin = await requirePermission('marketing.manage')
  if (!admin) return { ok: false, error: NOT_ADMIN }

  const code = String(formData.get('code') ?? '').trim().toUpperCase()
  const kind = String(formData.get('kind') ?? 'percent')
  const value = Number(formData.get('value') ?? 0)
  const maxUses = formData.get('max_uses') ? Number(formData.get('max_uses')) : null
  const maxPerUser = Number(formData.get('max_uses_per_user') ?? 1)
  const endsAt = formData.get('ends_at') ? new Date(String(formData.get('ends_at'))).toISOString() : null

  if (!/^[A-Z0-9_-]{3,24}$/.test(code)) return { ok: false, error: 'الكود: 3–24 حرفًا لاتينيًا/أرقام فقط.' }
  if (!['percent', 'fixed'].includes(kind)) return { ok: false, error: 'نوع الخصم غير صحيح.' }
  if (value <= 0 || (kind === 'percent' && value > 100)) return { ok: false, error: 'قيمة الخصم غير منطقية.' }

  const { data, error } = await getServiceClient()
    .from('coupons')
    .insert({
      code,
      kind,
      value,
      max_uses: maxUses,
      max_uses_per_user: maxPerUser,
      ends_at: endsAt,
      is_active: true,
      created_by: admin.userId,
    })
    .select('id')
    .single()
  if (error) return { ok: false, error: error.code === '23505' ? 'هذا الكود مستخدم بالفعل.' : GENERIC }

  await audit(admin.userId!, 'coupon.created', 'coupon', data.id, { code, kind, value })
  revalidatePath('/admin/coupons')
  return { ok: true }
}

export async function setCouponActive(couponId: string, active: boolean): Promise<ActionResult> {
  if (!hasEnv()) return { ok: false, error: NO_ENV }
  const admin = await requirePermission('marketing.manage')
  if (!admin) return { ok: false, error: NOT_ADMIN }
  const { error } = await getServiceClient().from('coupons').update({ is_active: active }).eq('id', couponId)
  if (error) return { ok: false, error: GENERIC }
  await audit(admin.userId!, active ? 'coupon.activated' : 'coupon.deactivated', 'coupon', couponId, {})
  revalidatePath('/admin/coupons')
  return { ok: true }
}

export async function updateCoupon(couponId: string, formData: FormData): Promise<ActionResult> {
  if (!hasEnv()) return { ok: false, error: NO_ENV }
  const admin = await requirePermission('marketing.manage'); if (!admin) return { ok: false, error: NOT_ADMIN }
  const code = String(formData.get('code') ?? '').trim().toUpperCase()
  const kind = String(formData.get('kind') ?? 'percent')
  const value = Number(formData.get('value') ?? 0)
  if (!/^[A-Z0-9_-]{3,24}$/.test(code) || !['percent','fixed'].includes(kind) || value <= 0 || (kind === 'percent' && value > 100)) return { ok:false,error:'راجعي الكود ونوع الخصم وقيمته.' }
  const payload = { code, kind, value, max_uses: formData.get('max_uses') ? Number(formData.get('max_uses')) : null, max_uses_per_user: Number(formData.get('max_uses_per_user') ?? 1), ends_at: formData.get('ends_at') ? new Date(String(formData.get('ends_at'))).toISOString() : null }
  const { error } = await getServiceClient().from('coupons').update(payload).eq('id', couponId)
  if (error) return { ok:false,error:error.code==='23505'?'هذا الكود مستخدم بالفعل.':GENERIC }
  await audit(admin.userId!,'coupon.updated','coupon',couponId,payload); revalidatePath('/admin/coupons'); return {ok:true}
}

export async function deleteCoupon(couponId: string): Promise<ActionResult> {
  if (!hasEnv()) return { ok: false, error: NO_ENV }
  const admin = await requirePermission('marketing.manage'); if (!admin) return { ok: false, error: NOT_ADMIN }
  const service=getServiceClient(); const {count}=await service.from('coupon_redemptions').select('id',{count:'exact',head:true}).eq('coupon_id',couponId)
  if((count??0)>0) return {ok:false,error:'لا يُحذف كوبون مستخدم حفاظًا على التقارير؛ أوقفيه بدلًا من ذلك.'}
  const {error}=await service.from('coupons').delete().eq('id',couponId);if(error)return{ok:false,error:GENERIC}
  await audit(admin.userId!,'coupon.deleted','coupon',couponId,{});revalidatePath('/admin/coupons');return{ok:true}
}

export async function createOffer(formData: FormData): Promise<ActionResult> {
  if (!hasEnv()) return { ok: false, error: NO_ENV }
  const admin = await requirePermission('marketing.manage')
  if (!admin) return { ok: false, error: NOT_ADMIN }

  const kind = String(formData.get('kind') ?? 'flash_sale')
  const title = String(formData.get('title') ?? '').trim()
  const description = String(formData.get('description') ?? '').trim()
  const badgeText = String(formData.get('badge_text') ?? '').trim() || null
  const discountKind = String(formData.get('discount_kind') ?? 'percent')
  const discountValue = Number(formData.get('discount_value') ?? 0)
  const endsAt = formData.get('ends_at') ? new Date(String(formData.get('ends_at'))).toISOString() : null
  const targetType = String(formData.get('target_type') ?? '') || null

  if (title.length < 3) return { ok: false, error: 'أدخلي عنوانًا للعرض.' }
  if (discountValue <= 0 || (discountKind === 'percent' && discountValue > 100))
    return { ok: false, error: 'قيمة الخصم غير منطقية.' }

  const service = getServiceClient()
  const { data, error } = await service
    .from('offers')
    .insert({
      kind,
      title,
      description,
      badge_text: badgeText,
      discount_kind: discountKind,
      discount_value: discountValue,
      starts_at: new Date().toISOString(),
      ends_at: endsAt,
      is_active: true,
    })
    .select('id')
    .single()
  if (error || !data) return { ok: false, error: GENERIC }

  if (targetType) {
    await service.from('offer_targets').insert({ offer_id: data.id, product_type: targetType })
  }

  await audit(admin.userId!, 'offer.created', 'offer', data.id, { kind, title, discountKind, discountValue, targetType })
  revalidatePath('/admin/offers')
  revalidatePath('/')
  return { ok: true }
}

export async function setOfferActive(offerId: string, active: boolean): Promise<ActionResult> {
  if (!hasEnv()) return { ok: false, error: NO_ENV }
  const admin = await requirePermission('marketing.manage')
  if (!admin) return { ok: false, error: NOT_ADMIN }
  const { error } = await getServiceClient().from('offers').update({ is_active: active }).eq('id', offerId)
  if (error) return { ok: false, error: GENERIC }
  await audit(admin.userId!, active ? 'offer.activated' : 'offer.deactivated', 'offer', offerId, {})
  revalidatePath('/admin/offers')
  revalidatePath('/')
  return { ok: true }
}

export async function updateOffer(offerId: string, formData: FormData): Promise<ActionResult> {
  if (!hasEnv()) return { ok: false, error: NO_ENV }
  const admin=await requirePermission('marketing.manage');if(!admin)return{ok:false,error:NOT_ADMIN}
  const title=String(formData.get('title')??'').trim();const discountKind=String(formData.get('discount_kind')??'percent');const discountValue=Number(formData.get('discount_value')??0)
  if(title.length<3||discountValue<=0||(discountKind==='percent'&&discountValue>100))return{ok:false,error:'راجعي عنوان العرض وقيمة الخصم.'}
  const payload={title,description:String(formData.get('description')??'').trim(),kind:String(formData.get('kind')??'flash_sale'),badge_text:String(formData.get('badge_text')??'').trim()||null,discount_kind:discountKind,discount_value:discountValue,ends_at:formData.get('ends_at')?new Date(String(formData.get('ends_at'))).toISOString():null}
  const service=getServiceClient();const{error}=await service.from('offers').update(payload).eq('id',offerId);if(error)return{ok:false,error:GENERIC}
  await service.from('offer_targets').delete().eq('offer_id',offerId);const targetType=String(formData.get('target_type')??'');if(targetType)await service.from('offer_targets').insert({offer_id:offerId,product_type:targetType})
  await audit(admin.userId!,'offer.updated','offer',offerId,{...payload,targetType});revalidatePath('/admin/offers');revalidatePath('/');return{ok:true}
}

export async function deleteOffer(offerId: string): Promise<ActionResult> {
  if (!hasEnv()) return { ok: false, error: NO_ENV }
  const admin=await requirePermission('marketing.manage');if(!admin)return{ok:false,error:NOT_ADMIN}
  const{error}=await getServiceClient().from('offers').delete().eq('id',offerId);if(error)return{ok:false,error:GENERIC}
  await audit(admin.userId!,'offer.deleted','offer',offerId,{});revalidatePath('/admin/offers');revalidatePath('/');return{ok:true}
}
