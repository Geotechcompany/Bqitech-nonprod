import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { Token } from '@/models/token'
import mongoose from 'mongoose'

export async function POST(request: Request) {
  try {
    const { db } = await connectToDatabase()
    const { userId, token, expires } = await request.json()

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        { error: 'Invalid user ID' },
        { status: 400 }
      )
    }

    // Store token with expiration and type
    await Token.create({
      userId: new mongoose.Types.ObjectId(userId),
      token,
      expires: new Date(expires),
      type: 'EMAIL_VERIFICATION'
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