'use server'

import { revalidatePath } from 'next/cache'
import { getServerClient } from '@/lib/supabase/server'

type Result = { ok: true; message: string } | { ok: false; error: string }

export async function cancelMyBooking(bookingId: string, reason: string): Promise<Result> {
  const supabase = await getServerClient()
  const { error } = await supabase.rpc('cancel_my_booking', { p_booking_id: bookingId, p_reason: reason.trim() })
  if (error) {
    if (error.message.includes('CANCELLATION_NOTICE_REQUIRED')) return { ok: false, error: 'انتهت مهلة الإلغاء الذاتي. تواصلي معنا لمراجعة الحالة.' }
    return { ok: false, error: 'تعذّر إلغاء الحجز الآن.' }
  }
  revalidatePath('/dashboard/bookings'); revalidatePath('/booking')
  return { ok: true, message: 'تم إلغاء الحجز، وأُعيد رصيد الباقة تلقائيًا إن كان مستخدمًا.' }
}

export async function requestMyBookingReschedule(bookingId: string, proposedStartsAt: string, reason: string): Promise<Result> {
  const proposed = new Date(proposedStartsAt)
  if (Number.isNaN(proposed.getTime())) return { ok: false, error: 'اختاري موعدًا مقترحًا صحيحًا.' }
  const supabase = await getServerClient()
  const { error } = await supabase.rpc('request_booking_reschedule', { p_booking_id: bookingId, p_proposed_starts_at: proposed.toISOString(), p_reason: reason.trim() })
  if (error) {
    if (error.message.includes('RESCHEDULE_ALREADY_PENDING')) return { ok: false, error: 'يوجد طلب تغيير قيد المراجعة بالفعل.' }
    if (error.message.includes('PROPOSED_SLOT_UNAVAILABLE')) return { ok: false, error: 'الموعد المقترح غير متاح فعليًا. اختاري وقتًا آخر.' }
    if (error.message.includes('RESCHEDULE_NOTICE_REQUIRED')) return { ok: false, error: 'انتهت مهلة تغيير الموعد الذاتي.' }
    if (error.message.includes('RESCHEDULE_LIMIT_REACHED')) return { ok: false, error: 'وصلتِ إلى الحد المسموح لتغييرات هذا الحجز.' }
    return { ok: false, error: 'تعذّر إرسال طلب تغيير الموعد.' }
  }
  revalidatePath('/dashboard/bookings')
  return { ok: true, message: 'أُرسل الموعد المقترح للإدارة وستصلك نتيجة المراجعة.' }
}
