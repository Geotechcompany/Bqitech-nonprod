import { NextResponse } from 'next/server'
import { rateLimit } from '@/lib/rate-limit'

export async function POST(req: Request) {
  const { identifier } = await req.json()
  
  try {
    const { success } = await rateLimit.limit(identifier)
    return NextResponse.json({ success })
  } catch (error) {
    console.error('Rate limit error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 