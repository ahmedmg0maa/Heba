import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getWorkshop, formatPrice } from '@/lib/data/catalog'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { MobileBuyBar } from '@/components/catalog/MobileBuyBar'
import { getPaymentSettings } from '@/lib/data/checkout'

type Props={params:Promise<{slug:string}>}
const dateFmt=new Intl.DateTimeFormat('ar-EG',{weekday:'long',day:'numeric',month:'long',year:'numeric',hour:'numeric',minute:'2-digit',timeZone:'Africa/Cairo'})
export async function generateMetadata({params}:Props):Promise<Metadata>{const workshop=await getWorkshop((await params).slug);return workshop?{title:workshop.title,description:workshop.description}:{title:'ورشة غير موجودة'}}
export const revalidate=120

export default async function WorkshopDetailPage({params}:Props){
  const workshop=await getWorkshop((await params).slug);if(!workshop)notFound()
  const paymentSettings=await getPaymentSettings()
  const orderingAvailable=Boolean(paymentSettings.instapay||paymentSettings.wallet||paymentSettings.bank)
  const seatsLeft=Math.max(0,workshop.seatsTotal-workshop.seatsReserved),soldOut=workshop.seatsTotal>0&&seatsLeft===0
  return <main className="border-b border-line bg-surface-raised"><section className="mx-auto grid max-w-6xl gap-10 px-6 py-14 lg:grid-cols-[1.35fr_.8fr]">
    <div><p className="text-sm font-bold text-antique-gold">ورشة منشورة</p><h1 className="mt-2 text-4xl font-bold text-deep-teal">{workshop.title}</h1><p className="mt-3 text-lg text-antique-gold">{workshop.subtitle}</p><p className="mt-6 max-w-3xl text-lg leading-loose text-text-soft">{workshop.description}</p>
      <div className="mt-8 grid gap-3 sm:grid-cols-3">{[['الموعد',dateFmt.format(new Date(workshop.startsAt))],['المكان',workshop.locationKind==='online'?'أونلاين مباشر':workshop.locationKind==='hybrid'?'حضوري وأونلاين':'حضوري'],['المقاعد',workshop.seatsTotal===0?'مفتوحة':`${seatsLeft.toLocaleString('ar-EG')} متبقية`]].map(([label,value])=><div key={label} className="rounded-xl border border-line bg-ivory/55 p-4"><p className="text-xs font-bold text-antique-gold">{label}</p><p className="mt-1 font-semibold text-deep-teal">{value}</p></div>)}</div>
    </div>
    <Card className="h-fit p-7"><div className="flex items-center justify-between gap-3"><p className="tnum text-3xl font-bold text-burgundy">{formatPrice(workshop.price)}</p>{soldOut?<Badge tone="sand">اكتمل العدد</Badge>:workshop.seatsTotal>0&&seatsLeft<=5?<Badge tone="burgundy">مقاعد متبقية</Badge>:<Badge tone="success">مفتوحة للحجز</Badge>}</div><p className="mt-5 border-t border-line pt-5 text-sm leading-loose text-text-soft">توضح صفحة الورشة المواعيد والمكان وعدد المقاعد. أي موارد أو تسجيلات إضافية لا تكون متاحة إلا إذا وردت في الوصف المنشور.</p>{orderingAvailable ? <Button href={soldOut?'#':`/checkout/workshop/${workshop.slug}`} size="lg" disabled={soldOut} className="mt-6 w-full">{soldOut?'اكتمل العدد':'اطلبي مقعدًا'}</Button> : <p className="mt-6 rounded-xl bg-ivory px-4 py-3 text-center text-sm font-medium text-text-soft" role="status">الحجز غير متاح قبل تفعيل وسيلة دفع من الإدارة.</p>}</Card>
  </section>{!soldOut&&orderingAvailable&&<MobileBuyBar price={workshop.price} compareAtPrice={workshop.compareAtPrice} ctaLabel="اطلبي مقعدًا" ctaHref={`/checkout/workshop/${workshop.slug}`}/>}</main>
}
