import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { User } from '@/models/user'
import { Token } from '@/models/token'

export async function POST(request: Request) {
  try {
    const conn = await connectToDatabase()
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json(
        { error: 'Verification code is required' },
        { status: 400 }
      )
    }

    const verificationToken = await conn.models.Token.findOne({
      token: { $regex: new RegExp(`^${token}$`, 'i') },
      type: 'EMAIL_VERIFICATION',
      expires: { $gt: new Date() }
    })

    if (!verificationToken) {
      return NextResponse.json(
        { error: 'Invalid or expired verification code' },
        { status: 400 }
      )
    }

    const user = await User.findById(verificationToken.userId)
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Update user and clean up token
    await Promise.all([
      User.findByIdAndUpdate(user._id, { 
        $set: { emailVerified: new Date() }
      }),
      conn.models.Token.deleteMany({
        userId: user._id,
        type: 'EMAIL_VERIFICATION'
      })
    ])

    return NextResponse.json({ 
      success: true,
      message: 'Email verified successfully'
    })

  } catch (error) {
    console.error('Email verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export {}; 