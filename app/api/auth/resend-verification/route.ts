import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { User } from '@/models/user'
import { Token } from '@/models/token'
import { generateEmailVerificationToken } from '@/lib/tokens'
import { sendVerificationEmail } from '@/lib/mailer'
import mongoose from 'mongoose'

export async function POST(request: Request) {
  try {
    // Connect to MongoDB first
    await connectToDatabase()

    const { email } = await request.json()
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Find user by email
    const user = await User.findOne({ email })
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Generate new verification token
    const { token, expires } = generateEmailVerificationToken()

    // Store token in separate collection
    await Token.create({
      userId: user._id,
      token,
      type: 'EMAIL_VERIFICATION',
      expires: new Date(expires)
    })

    // Send verification email
    await sendVerificationEmail(user.email, token)

    return NextResponse.json(
      { message: 'Verification email resent' },
      { status: 200 }
    )

  } catch (error) {
    console.error('Resend verification error:', error)
    return NextResponse.json(
      { error: 'Failed to resend verification email' },
      { status: 500 }
    )
  }
} 