import { getServerClient, getServiceClient } from '@/lib/supabase/server'
import { privateJson, privateRedirect } from '@/lib/delivery/security'

export async function GET(request:Request,{params}:{params:Promise<{slug:string;id:string}>}){
  const {slug,id}=await params,supabase=await getServerClient(),{data:{user}}=await supabase.auth.getUser();if(!user)return privateRedirect(new URL('/auth/login',request.url).toString())
  const {data:registration}=await supabase.from('workshop_registrations').select('workshop_id,workshops!inner(slug)').eq('user_id',user.id).eq('status','registered').eq('workshops.slug',slug).maybeSingle();if(!registration)return privateJson('غير مصرح.',403)
  const service=getServiceClient(),{data:recording}=await service.from('workshop_recordings').select('title,storage_path,published_at').eq('id',id).eq('workshop_id',registration.workshop_id).not('published_at','is',null).maybeSingle();if(!recording)return privateJson('التسجيل غير متاح.',404)
  const {data,error}=await service.storage.from('workshop-recordings').createSignedUrl(recording.storage_path,120);if(error||!data?.signedUrl)return privateJson('تعذّر تجهيز التسجيل.',500);return privateRedirect(data.signedUrl)
}
