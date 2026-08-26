import { cookies } from 'next/headers'
import { getServerClient, getServiceClient } from '@/lib/supabase/server'
import { privateJson, privateRedirect, sha256 } from '@/lib/delivery/security'

export async function GET(_request: Request, { params }: { params: Promise<{ lessonId: string }> }) {
  const { lessonId } = await params
  const supabase = await getServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return privateJson('يلزم تسجيل الدخول.', 401)

  const token = (await cookies()).get('heba_video_admission')?.value
  if (!token) return privateJson('انتهت جلسة المشاهدة. افتحي الدرس مرة أخرى.', 401)

  const service = getServiceClient()
  const { data: admitted, error: admissionError } = await service.rpc('validate_video_admission', {
    p_user_id: user.id,
    p_lesson_id: lessonId,
    p_token_hash: sha256(token),
  })
  if (admissionError || admitted !== true) {
    return privateJson('انتهت جلسة المشاهدة. افتحي الدرس مرة أخرى.', 403)
  }

  const { data: lesson } = await service
    .from('course_lessons')
    .select('video_path')
    .eq('id', lessonId)
    .maybeSingle()
  if (!lesson?.video_path) return privateJson('فيديو الدرس غير متاح.', 404)

  const { data, error } = await service.storage.from('course-videos').createSignedUrl(lesson.video_path, 120)
  if (error || !data?.signedUrl) return privateJson('تعذّر تجهيز الفيديو.', 500)
  return privateRedirect(data.signedUrl)
}
