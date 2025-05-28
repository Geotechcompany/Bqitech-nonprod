import { connectToDatabase } from "@/lib/mongodb";

import { User } from "@/models/user";
import { Token } from "@/models/token";

import { NextResponse } from "next/server";
import { generateEmailVerificationToken } from "@/lib/tokens";
import { sendVerificationEmail } from '@/lib/mailer'

import { compare } from "bcryptjs";

export async function POST(request: Request) {
  try {
    const conn = await connectToDatabase();
    const { email, password } = await request.json();

    // Existing authentication logic...
    const user = await User.findOne({ email });
    if (!user || !(await compare(password, user.password))) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Add verification check
    if (!user.emailVerified) {
      // Generate and store new verification token
      const { token, expires } = generateEmailVerificationToken();
      await Token.create({
        userId: user._id,
        token,
        type: 'EMAIL_VERIFICATION',
        expires: new Date(expires)
      });

      // Send verification email
      await sendVerificationEmail(user.email, token);

      return NextResponse.json(
        { 
          error: "Email verification required",
          code: 'VERIFICATION_REQUIRED',
          email: user.email 
        },
        { status: 403 }
      );
    }

    // Existing successful login logic...
  } catch (error) {
    // ... existing error handling ...
  }
} 