import { NextResponse } from 'next/server'
import { getServerClient } from '@/lib/supabase/server'
import { hasSupabasePublicConfig } from '@/lib/supabase/public-key'

function icsText(value: string) {
  return value.replace(/[\\,;\n\r]/g, (character) => character === '\n' || character === '\r' ? '\\n' : `\\${character}`)
}

function icsDate(value: string) {
  return new Date(value).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z')
}

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!hasSupabasePublicConfig()) return new NextResponse('Not found', { status: 404 })
  const { id } = await params
  const supabase = await getServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new NextResponse('Unauthorized', { status: 401 })
  const { data: booking } = await supabase
    .from('bookings')
    .select('id, starts_at, ends_at, status, services!inner(title)')
    .eq('id', id)
    .eq('user_id', user.id)
    .in('status', ['pending', 'confirmed'])
    .maybeSingle()
  if (!booking) return new NextResponse('Not found', { status: 404 })
  const service = Array.isArray(booking.services) ? booking.services[0] : booking.services
  const body = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Heba ElSherif//Booking//AR', 'CALSCALE:GREGORIAN', 'BEGIN:VEVENT',
    `UID:booking-${booking.id}@hebaelsherif`, `DTSTAMP:${icsDate(new Date().toISOString())}`, `DTSTART:${icsDate(booking.starts_at)}`, `DTEND:${icsDate(booking.ends_at)}`,
    `SUMMARY:${icsText(service?.title ?? 'جلسة')}`, 'DESCRIPTION:موعد عبر منصة هبة الشريف. التوقيت: Africa/Cairo.', 'END:VEVENT', 'END:VCALENDAR', '',
  ].join('\r\n')
  return new NextResponse(body, { headers: { 'content-type': 'text/calendar; charset=utf-8', 'content-disposition': `attachment; filename="booking-${booking.id}.ics"`, 'cache-control': 'private, no-store' } })
}
