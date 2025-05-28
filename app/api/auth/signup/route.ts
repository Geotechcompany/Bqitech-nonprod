import { NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import connectToDatabase from '@/lib/mongodb'
import mongoose from 'mongoose'
import { User } from '@/models/user'
import axios from 'axios'
import { generateEmailVerificationToken } from '@/lib/tokens'
import { sendVerificationEmail } from '@/lib/mailer'
import { Token } from '@/models/token'

const verifyCaptcha = async (token: string) => {
  const response = await axios.post(
    'https://www.google.com/recaptcha/api/siteverify',
    `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${token}`
  );
  return response.data.success;
};

export async function POST(req: Request) {
  try {
    // Connect to database first
    await connectToDatabase();

    const { email, password, name, token } = await req.json()

    // Validate input
    if (!email || !password || !name || !token) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Check if user exists using the imported User model
    const existingUser = await User.findOne({ email: email.toLowerCase() })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      )
    }

    // Verify CAPTCHA
    if (!(await verifyCaptcha(token))) {
      return NextResponse.json(
        { error: "Security check failed. Please try again." },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await hash(password, 12)

    // Create user using the imported User model
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: 'USER'
    })

    // Generate and store verification token
    const { token: verificationToken, expires } = generateEmailVerificationToken()

    // Add validation for token generation
    if (!verificationToken || !expires) {
      console.error('Token generation failed')
      return NextResponse.json(
        { error: 'Failed to generate verification token' },
        { status: 500 }
      )
    }

    // Add error handling for token storage
    try {
      await Token.create({
        userId: user._id,
        token: verificationToken,
        type: 'EMAIL_VERIFICATION',
        expires: new Date(expires)
      })
    } catch (storageError) {
      console.error('Token storage failed:', storageError)
      return NextResponse.json(
        { error: 'Failed to store verification token' },
        { status: 500 }
      )
    }

    // Send verification email
    await sendVerificationEmail(email, verificationToken)

    return NextResponse.json({
      message: 'User created successfully',
      user: {
        id: user._id,
        email: user.email,
        role: user.role
      }
    })
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 