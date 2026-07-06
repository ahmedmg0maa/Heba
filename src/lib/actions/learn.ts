'use server'

import { getServerClient, getServiceClient } from '@/lib/supabase/server'

type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string }

const NO_ENV = 'غير متاح في بيئة العرض التجريبية.'
const NOT_ALLOWED = 'ليس لديك وصول لهذا الدرس.'
const GENERIC = 'حدث خطأ — حاولي مرة أخرى.'

const hasEnv = () =>
  Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
      process.env.SUPABASE_SERVICE_ROLE_KEY,
  )

async function requireUser() {
  const supabase = await getServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return { supabase, user }
}

// Resolve a lesson's course + video path and verify the caller may access it.
async function checkLessonAccess(lessonId: string) {
  const { supabase, user } = await requireUser()
  if (!user) return null
  const { data: lesson } = await supabase
    .from('course_lessons')
    .select('id, video_path, is_preview, course_modules!inner(course_id)')
    .eq('id', lessonId)
    .maybeSingle()
  if (!lesson) return null
  const mod = Array.isArray(lesson.course_modules) ? lesson.course_modules[0] : lesson.course_modules
  const courseId = mod?.course_id as string
  if (lesson.is_preview) return { user, courseId, videoPath: lesson.video_path as string | null }
  const { data: enrollment } = await supabase
    .from('course_enrollments')
    .select('id')
    .eq('user_id', user.id)
    .eq('course_id', courseId)
    .maybeSingle()
  if (!enrollment) return null
  return { user, courseId, videoPath: lesson.video_path as string | null }
}

export async function getLessonVideoUrl(lessonId: string): Promise<ActionResult<{ url: string }>> {
  if (!hasEnv()) return { ok: false, error: NO_ENV }
  const access = await checkLessonAccess(lessonId)
  if (!access) return { ok: false, error: NOT_ALLOWED }
  if (!access.videoPath) return { ok: false, error: 'لم يُرفع فيديو هذا الدرس بعد.' }

  const { data, error } = await getServiceClient()
    .storage.from('course-videos')
    .createSignedUrl(access.videoPath, 60 * 60) // 1h — expires with the study session
  if (error || !data) return { ok: false, error: GENERIC }
  return { ok: true, data: { url: data.signedUrl } }
}

export async function getResourceUrl(resourceId: string): Promise<ActionResult<{ url: string }>> {
  if (!hasEnv()) return { ok: false, error: NO_ENV }
  const { supabase, user } = await requireUser()
  if (!user) return { ok: false, error: NOT_ALLOWED }

  // lesson_resources SELECT is already enrollment-gated by RLS.
  const { data: resource } = await supabase
    .from('lesson_resources')
    .select('id, file_path')
    .eq('id', resourceId)
    .maybeSingle()
  if (!resource) return { ok: false, error: NOT_ALLOWED }

  const { data, error } = await getServiceClient()
    .storage.from('course-resources')
    .createSignedUrl(resource.file_path, 10 * 60)
  if (error || !data) return { ok: false, error: GENERIC }
  return { ok: true, data: { url: data.signedUrl } }
}

export async function markLessonComplete(lessonId: string, completed: boolean): Promise<ActionResult<{ percent: number }>> {
  if (!hasEnv()) return { ok: false, error: NO_ENV }
  const access = await checkLessonAccess(lessonId)
  if (!access) return { ok: false, error: NOT_ALLOWED }
  const { supabase } = await requireUser()

  const { error: upErr } = await supabase.from('lesson_progress').upsert(
    {
      user_id: access.user.id,
      lesson_id: lessonId,
      completed_at: completed ? new Date().toISOString() : null,
    },
    { onConflict: 'user_id,lesson_id' },
  )
  if (upErr) return { ok: false, error: GENERIC }

  // Recompute course percent from scratch — idempotent and drift-free.
  const { data: modules } = await supabase
    .from('course_modules')
    .select('id, course_lessons(id)')
    .eq('course_id', access.courseId)
  const lessonIds = (modules ?? []).flatMap((m) => (m.course_lessons ?? []).map((l) => l.id))
  const total = lessonIds.length
  let percent = 0
  if (total > 0) {
    const { count } = await supabase
      .from('lesson_progress')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', access.user.id)
      .in('lesson_id', lessonIds)
      .not('completed_at', 'is', null)
    percent = Math.round(((count ?? 0) / total) * 10000) / 100
  }

  const { error: progErr } = await supabase.from('course_progress').upsert(
    {
      user_id: access.user.id,
      course_id: access.courseId,
      percent,
      last_lesson_id: lessonId,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,course_id' },
  )
  if (progErr) return { ok: false, error: GENERIC }

  return { ok: true, data: { percent } }
}

export async function saveNote(lessonId: string, content: string, noteId?: string): Promise<ActionResult<{ id: string }>> {
  if (!hasEnv()) return { ok: false, error: NO_ENV }
  const { supabase, user } = await requireUser()
  if (!user) return { ok: false, error: NOT_ALLOWED }
  const trimmed = content.trim()
  if (!trimmed) return { ok: false, error: 'اكتبي ملاحظتك أولًا.' }

  if (noteId) {
    const { error } = await supabase
      .from('course_notes')
      .update({ content: trimmed })
      .eq('id', noteId)
      .eq('user_id', user.id)
    if (error) return { ok: false, error: GENERIC }
    return { ok: true, data: { id: noteId } }
  }

  const { data, error } = await supabase
    .from('course_notes')
    .insert({ user_id: user.id, lesson_id: lessonId, content: trimmed })
    .select('id')
    .single()
  if (error || !data) return { ok: false, error: GENERIC }
  return { ok: true, data: { id: data.id } }
}

export async function deleteNote(noteId: string): Promise<ActionResult<null>> {
  if (!hasEnv()) return { ok: false, error: NO_ENV }
  const { supabase, user } = await requireUser()
  if (!user) return { ok: false, error: NOT_ALLOWED }
  const { error } = await supabase.from('course_notes').delete().eq('id', noteId).eq('user_id', user.id)
  if (error) return { ok: false, error: GENERIC }
  return { ok: true, data: null }
}
