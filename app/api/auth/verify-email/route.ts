import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { User } from '@/models/user';
import { Token } from '@/models/token';

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400 }
      );
    }

    const verificationToken = await Token.findOne({
      token,
      type: 'EMAIL_VERIFICATION'
    });

    if (!verificationToken || verificationToken.expires < new Date()) {
      return NextResponse.json(
        { error: 'Invalid or expired verification token' },
        { status: 400 }
      );
    }

    const user = await User.findById(verificationToken.userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Update user and clean up token
    await Promise.all([
      User.updateOne(
        { _id: user._id },
        { $set: { emailVerified: new Date() } }
      ),
      Token.deleteMany({
        userId: user._id,
        type: 'EMAIL_VERIFICATION'
      })
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify email' },
      { status: 500 }
    );
  }
} 