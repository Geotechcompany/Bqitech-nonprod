import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  const cookieStore = cookies()
  const consent = cookieStore.get('cookieConsent')
  return NextResponse.json({ hasConsent: consent?.value === 'true' })
}

export async function POST(request: Request) {
  const { consent } = await request.json()
  const cookieStore = cookies()
  cookieStore.set('cookieConsent', consent ? 'true' : 'false', {
    path: '/',
    maxAge: 60 * 60 * 24 * 365, // 1 year
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  })
  return NextResponse.json({ success: true })
}