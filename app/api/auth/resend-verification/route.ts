import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { User } from '@/models/user'
import { Token } from '@/models/token'
import { generateEmailVerificationToken } from '@/lib/tokens'
import { sendVerificationEmail } from '@/lib/mailer'

export async function POST(request: Request) {
  try {
    const conn = await connectToDatabase()
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const user = await User.findOne({ email })
    if (!user) {
      return NextResponse.json(
        { error: 'No user found with this email' },
        { status: 404 }
      )
    }

    // Revoke existing tokens
    await conn.models.Token.deleteMany({
      userId: user._id,
      type: 'EMAIL_VERIFICATION'
    })

    // Generate new token
    const { token, expires } = generateEmailVerificationToken()
    await conn.models.Token.create({
      userId: user._id,
      token,
      type: 'EMAIL_VERIFICATION',
      expires
    })

    // Send verification email
    await sendVerificationEmail(email, token)

    return NextResponse.json({
      success: true,
      message: 'New verification code sent'
    })

  } catch (error) {
    console.error('Resend verification error:', error)
    return NextResponse.json(
      { error: 'Failed to resend verification code' },
      { status: 500 }
    )
  }
} 