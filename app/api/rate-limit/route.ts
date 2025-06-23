import { NextResponse } from 'next/server'
import { rateLimit } from '@/lib/rate-limit'
import { headers } from 'next/headers'

export async function POST() {
  try {
    const headersList = headers()
    const identifier = headersList.get('x-forwarded-for') || 'anonymous'
    
    const result = await rateLimit.limit(identifier)
    
    return NextResponse.json({
      success: true,
      remaining: result.remaining,
      limit: result.limit,
      reset: result.reset
    })
  } catch (error) {
    console.error('Rate limit error:', error)
    return NextResponse.json(
      { error: 'Rate limit error' },
      { status: 500 }
    )
  }
} 