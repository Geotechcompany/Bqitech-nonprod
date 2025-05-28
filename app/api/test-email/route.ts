import { NextResponse } from 'next/server'
import { sendVerificationEmail } from '@/lib/mailer'

export async function GET() {
  try {
    await sendVerificationEmail('noreply.geogigster@gmail.com', '123456')
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Email test failed:', error)
    return NextResponse.json(
      { error: 'Failed to send test email' },
      { status: 500 }
    )
  }
} 