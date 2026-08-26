import { getServerClient, getServiceClient } from '@/lib/supabase/server'
import { privateJson, privateRedirect } from '@/lib/delivery/security'

export async function GET(request:Request,{params}:{params:Promise<{slug:string;id:string}>}){
  const {slug,id}=await params,supabase=await getServerClient(),{data:{user}}=await supabase.auth.getUser();if(!user)return privateRedirect(new URL('/auth/login',request.url).toString())
  const {data:registration}=await supabase.from('workshop_registrations').select('workshop_id,workshops!inner(slug)').eq('user_id',user.id).eq('status','registered').eq('workshops.slug',slug).maybeSingle();if(!registration)return privateJson('غير مصرح.',403)
  const service=getServiceClient(),{data:resource}=await service.from('workshop_resources').select('title,file_path,kind').eq('id',id).eq('workshop_id',registration.workshop_id).maybeSingle();if(!resource)return privateJson('المورد غير موجود.',404)
  if(resource.kind==='link'){
    let target:URL;try{target=new URL(resource.file_path)}catch{return privateJson('رابط المورد غير صالح.',400)}
    if(!['https:','http:'].includes(target.protocol))return privateJson('رابط المورد غير صالح.',400)
    return privateRedirect(target.toString())
  }
  const {data,error}=await service.storage.from('course-resources').createSignedUrl(resource.file_path,90,{download:resource.title});if(error||!data?.signedUrl)return privateJson('تعذّر تجهيز المورد.',500);return privateRedirect(data.signedUrl)
}
