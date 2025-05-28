import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { Token } from '@/models/token'

export async function POST(request: Request) {
  try {
    const conn = await connectToDatabase()
    const { userId, token, expires } = await request.json()

    if (!userId || !token || !expires) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Delete existing tokens
    await conn.models.Token.deleteMany({
      userId,
      type: 'EMAIL_VERIFICATION'
    })

    // Create new token
    await conn.models.Token.create({
      userId,
      token,
      type: 'EMAIL_VERIFICATION',
      expires: new Date(expires)
    })

    return NextResponse.json({ success: true })
    
  } catch (error) {
    console.error('Token storage error:', error)
    return NextResponse.json(
      { error: 'Failed to store verification token' },
      { status: 500 }
    )
  }
} 