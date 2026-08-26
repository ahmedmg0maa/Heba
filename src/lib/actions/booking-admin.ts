'use server'

import { revalidatePath } from 'next/cache'
import { requirePermission } from '@/lib/auth/permissions'
import { getServiceClient } from '@/lib/supabase/server'

type Result = { ok: true } | { ok: false; error: string }

function refresh() {
  revalidatePath('/admin/bookings')
  revalidatePath('/booking')
  revalidatePath('/services')
}

export async function saveAvailability(formData: FormData): Promise<Result> {
  const admin = await requirePermission('availability.manage')
  if (!admin) return { ok: false, error: 'لا تملكين صلاحية إدارة الإتاحة.' }
  const serviceId = String(formData.get('service_id') ?? '')
  const weekdays = formData.getAll('weekdays').map(Number).filter((day) => day >= 0 && day <= 6)
  if (!serviceId) return { ok: false, error: 'الخدمة غير محددة.' }
  if (weekdays.length === 0) return { ok: false, error: 'اختاري يوم عمل واحدًا على الأقل.' }

  const rows: { service_id: string; weekday: number; start_time: string; end_time: string; timezone: string }[] = []
  for (const weekday of weekdays) {
    const startTime = String(formData.get(`start_${weekday}`) ?? '')
    const endTime = String(formData.get(`end_${weekday}`) ?? '')
    if (!/^\d{2}:\d{2}$/.test(startTime) || !/^\d{2}:\d{2}$/.test(endTime) || startTime >= endTime)
      return { ok: false, error: `راجعي وقت البداية والنهاية لليوم رقم ${weekday + 1}.` }
    rows.push({ service_id: serviceId, weekday, start_time: startTime, end_time: endTime, timezone: 'Africa/Cairo' })
  }

  const service = getServiceClient()
  const { error: deleteError } = await service.from('availability_rules').delete().eq('service_id', serviceId)
  if (deleteError) return { ok: false, error: 'تعذّر تحديث الجدول.' }
  const { error } = await service.from('availability_rules').insert(rows)
  if (error) return { ok: false, error: 'تعذّر حفظ مواعيد الإتاحة.' }
  await service.from('audit_logs').insert({
    actor_id: admin.userId,
    action: 'availability.updated',
    entity_type: 'service',
    entity_id: serviceId,
    meta: { rules: rows },
  })
  refresh()
  return { ok: true }
}

export async function saveAvailabilityException(formData: FormData): Promise<Result> {
  const admin = await requirePermission('availability.manage')
  if (!admin) return { ok: false, error: 'لا تملكين صلاحية إدارة الإتاحة.' }
  const serviceId = String(formData.get('service_id') ?? '')
  const date = String(formData.get('date') ?? '')
  const mode = String(formData.get('mode') ?? 'closed')
  const reason = String(formData.get('reason') ?? '').trim().slice(0, 500)
  const startTime = String(formData.get('exception_start') ?? '') || null
  const endTime = String(formData.get('exception_end') ?? '') || null
  if (!serviceId || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return { ok: false, error: 'اختاري تاريخًا صحيحًا.' }
  if (!['closed', 'custom', 'holiday', 'blackout'].includes(mode)) return { ok: false, error: 'نوع الاستثناء غير صحيح.' }
  if (mode === 'custom' && (!startTime || !endTime || startTime >= endTime))
    return { ok: false, error: 'حددي وقتًا استثنائيًا صحيحًا.' }
  const payload = {
    service_id: serviceId,
    date,
    is_closed: mode !== 'custom',
    start_time: mode === 'custom' ? startTime : null,
    end_time: mode === 'custom' ? endTime : null,
    kind: mode,
    reason,
  }
  const { error } = await getServiceClient().from('availability_exceptions').upsert(payload, { onConflict: 'service_id,date' })
  if (error) return { ok: false, error: 'تعذّر حفظ الاستثناء.' }
  await getServiceClient().from('audit_logs').insert({
    actor_id: admin.userId,
    action: `availability.${mode}`,
    entity_type: 'service',
    entity_id: serviceId,
    meta: payload,
  })
  refresh()
  return { ok: true }
}

export async function saveBookingSlotOverride(formData: FormData): Promise<Result> {
  const admin = await requirePermission('availability.manage')
  if (!admin?.userId) return { ok: false, error: 'لا تملكين صلاحية إدارة الإتاحة.' }
  const serviceId = String(formData.get('service_id') ?? '')
  const date = String(formData.get('date') ?? '')
  const startTime = String(formData.get('start_time') ?? '')
  const mode = String(formData.get('mode') ?? '')
  const reason = String(formData.get('reason') ?? '').trim().slice(0, 500)
  if (!serviceId || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(startTime) || !['open', 'closed'].includes(mode))
    return { ok: false, error: 'راجعي تاريخ ووقت وحالة الـ slot.' }
  const service = getServiceClient()
  const payload = { service_id: serviceId, date, start_time: startTime, mode, reason, created_by: admin.userId }
  const { data, error } = await service.from('booking_slot_overrides').upsert(payload, { onConflict: 'service_id,date,start_time' }).select('id').single()
  if (error || !data) return { ok: false, error: 'تعذّر حفظ تعديل الـ slot.' }
  await service.from('audit_logs').insert({ actor_id: admin.userId, action: `availability.slot_${mode}`, entity_type: 'booking_slot_override', entity_id: data.id, meta: { serviceId, date, startTime, reason } })
  refresh(); return { ok: true }
}

export async function deleteBookingSlotOverride(overrideId: string): Promise<Result> {
  const admin = await requirePermission('availability.manage')
  if (!admin?.userId) return { ok: false, error: 'لا تملكين صلاحية إدارة الإتاحة.' }
  const service = getServiceClient()
  const { data: previous } = await service.from('booking_slot_overrides').select('*').eq('id', overrideId).maybeSingle()
  if (!previous) return { ok: false, error: 'تعديل الـ slot غير موجود.' }
  const { error } = await service.from('booking_slot_overrides').delete().eq('id', overrideId)
  if (error) return { ok: false, error: 'تعذّر حذف تعديل الـ slot.' }
  await service.from('audit_logs').insert({ actor_id: admin.userId, action: 'availability.slot_override_deleted', entity_type: 'booking_slot_override', entity_id: overrideId, meta: { serviceId: previous.service_id, date: previous.date, startTime: previous.start_time } })
  refresh(); return { ok: true }
}

export async function resolveBookingReschedule(requestId: string, approve: boolean, note = ''): Promise<Result> {
  const admin = await requirePermission('bookings.manage')
  if (!admin) return { ok: false, error: 'لا تملكين صلاحية إدارة الحجوزات.' }
  const { error } = await getServiceClient().rpc('resolve_booking_reschedule', {
    p_request_id: requestId, p_approve: approve, p_admin_note: note.trim().slice(0, 1000),
  })
  if (error) return { ok: false, error: error.message.includes('PROPOSED_SLOT_UNAVAILABLE') ? 'الموعد المقترح لم يعد متاحًا.' : 'تعذّر حسم طلب تغيير الموعد.' }
  refresh(); revalidatePath('/dashboard/bookings')
  return { ok: true }
}

export async function deleteAvailabilityException(exceptionId: string): Promise<Result> {
  const admin = await requirePermission('availability.manage')
  if (!admin) return { ok: false, error: 'لا تملكين صلاحية إدارة الإتاحة.' }
  const service = getServiceClient()
  const { data: exception } = await service.from('availability_exceptions').select('*').eq('id', exceptionId).maybeSingle()
  if (!exception) return { ok: false, error: 'الاستثناء غير موجود.' }
  const { error } = await service.from('availability_exceptions').delete().eq('id', exceptionId)
  if (error) return { ok: false, error: 'تعذّر حذف الاستثناء.' }
  await service.from('audit_logs').insert({
    actor_id: admin.userId,
    action: 'availability.exception_deleted',
    entity_type: 'service',
    entity_id: exception.service_id,
    meta: exception,
  })
  refresh()
  return { ok: true }
}

export async function saveAvailabilityWindow(formData: FormData): Promise<Result> {
  const admin = await requirePermission('availability.manage')
  if (!admin?.userId) return { ok: false, error: 'لا تملكين صلاحية إدارة الإتاحة.' }
  const serviceId = String(formData.get('service_id') ?? '')
  const weekday = Number(formData.get('weekday'))
  const startTime = String(formData.get('start_time') ?? '')
  const endTime = String(formData.get('end_time') ?? '')
  if (!serviceId || weekday < 0 || weekday > 6 || !/^\d{2}:\d{2}$/.test(startTime) || !/^\d{2}:\d{2}$/.test(endTime) || startTime >= endTime) return { ok: false, error: 'راجعي اليوم وبداية النافذة ونهايتها.' }
  const service = getServiceClient()
  const { data, error } = await service.from('availability_rules').insert({ service_id: serviceId, weekday, start_time: startTime, end_time: endTime, timezone: 'Africa/Cairo' }).select('id').single()
  if (error) return { ok: false, error: error.code === '23P01' ? 'هذه النافذة تتداخل مع نافذة موجودة.' : 'تعذّر حفظ نافذة الإتاحة.' }
  await service.from('audit_logs').insert({ actor_id: admin.userId, action: 'availability.window_created', entity_type: 'availability_rule', entity_id: data.id, meta: { serviceId, weekday, startTime, endTime } })
  refresh(); return { ok: true }
}

export async function deleteAvailabilityWindow(windowId: string): Promise<Result> {
  const admin = await requirePermission('availability.manage')
  if (!admin?.userId) return { ok: false, error: 'لا تملكين صلاحية إدارة الإتاحة.' }
  const service = getServiceClient()
  const { data } = await service.from('availability_rules').select('*').eq('id', windowId).maybeSingle()
  if (!data) return { ok: false, error: 'نافذة الإتاحة غير موجودة.' }
  const { error } = await service.from('availability_rules').delete().eq('id', windowId)
  if (error) return { ok: false, error: 'تعذّر حذف النافذة.' }
  await service.from('audit_logs').insert({ actor_id: admin.userId, action: 'availability.window_deleted', entity_type: 'availability_rule', entity_id: windowId, meta: data })
  refresh(); return { ok: true }
}

// Backward-compatible alias used by older clients.
export const closeAvailabilityDate = saveAvailabilityException
