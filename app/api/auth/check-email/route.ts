import { NextResponse } from 'next/server'
import { z } from 'zod'
import { User } from '@/models/user'
import connectToDatabase from '@/lib/mongodb'

export async function GET(req: Request) {
  try {
    await connectToDatabase()
    
    const { searchParams } = new URL(req.url)
    const email = searchParams.get('email')

    // Validate email format
    if (!email || !z.string().email().safeParse(email).success) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      )
    }

    // Check email existence
    const user = await User.findOne({ email }).lean()
    
    return NextResponse.json({
      available: !user
    }, { 
      status: user ? 409 : 200 
    })
    
  } catch (error) {
    console.error('Email check error:', error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
} 