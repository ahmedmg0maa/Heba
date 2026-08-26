import { getServerClient, getServiceClient } from '@/lib/supabase/server'
import { privateJson, privateRedirect } from '@/lib/delivery/security'

export async function GET(_request: Request, { params }: { params: Promise<{ resourceId: string }> }) {
  const { resourceId } = await params
  const supabase = await getServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return privateJson('يلزم تسجيل الدخول.', 401)

  // This query is enrollment-gated by RLS; the elevated client is used only after it succeeds.
  const { data: resource } = await supabase
    .from('lesson_resources')
    .select('title,file_path')
    .eq('id', resourceId)
    .maybeSingle()
  if (!resource) return privateJson('الملف غير متاح لهذا الحساب.', 403)

  const { data, error } = await getServiceClient().storage
    .from('course-resources')
    .createSignedUrl(resource.file_path, 90, { download: resource.title })
  if (error || !data?.signedUrl) return privateJson('تعذّر تجهيز الملف.', 500)
  return privateRedirect(data.signedUrl)
}
