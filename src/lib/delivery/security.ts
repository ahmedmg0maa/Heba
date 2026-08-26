import 'server-only'

import { createHash } from 'node:crypto'
import { NextResponse } from 'next/server'

export function sha256(value: string) {
  return createHash('sha256').update(value).digest('hex')
}

export function requestFingerprint(request: Request) {
  const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? ''
  const userAgent = request.headers.get('user-agent') ?? ''
  return sha256(`${forwarded}\n${userAgent}`)
}

export function privateRedirect(url: string) {
  const response = NextResponse.redirect(url, 302)
  response.headers.set('Cache-Control', 'private, no-store, max-age=0')
  response.headers.set('Pragma', 'no-cache')
  response.headers.set('Referrer-Policy', 'no-referrer')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  return response
}

export function privateJson(error: string, status: number) {
  const response = NextResponse.json({ error }, { status })
  response.headers.set('Cache-Control', 'private, no-store, max-age=0')
  response.headers.set('Pragma', 'no-cache')
  response.headers.set('Referrer-Policy', 'no-referrer')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  return response
}
