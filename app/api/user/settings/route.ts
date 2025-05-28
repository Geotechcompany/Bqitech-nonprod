import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { User } from "@/models/user";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import mongoose from "mongoose";
import { generateEmailVerificationToken } from "@/lib/tokens";
import { Token } from "@/models/token";
import { sendVerificationEmail } from '@/lib/mailer';

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, email } = await request.json();
    
    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Find current user
    const currentUser = await User.findOne({ email: session.user.email });
    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if email is being changed
    if (email !== currentUser.email) {
      // Require existing email to be verified
      if (!currentUser.emailVerified) {
        return NextResponse.json(
          { error: "Current email must be verified before changing" },
          { status: 403 }
        );
      }

      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return NextResponse.json(
          { error: "Email already in use" },
          { status: 400 }
        );
      }
    }

    // Update user information
    const updateData: Record<string, any> = {
      name: name,
      email: email.toLowerCase(),
    };

    // Reset verification status if email changes
    if (email !== currentUser.email) {
      updateData.emailVerified = null;
      
      // Generate new verification token
      const { token, expires } = generateEmailVerificationToken();
      await Token.create({
        userId: currentUser._id,
        token,
        type: 'EMAIL_VERIFICATION',
        expires: new Date(expires)
      });

      await sendVerificationEmail(email, token);
    }

    const updatedUser = await User.findOneAndUpdate(
      { _id: currentUser._id },
      updateData,
      { new: true, select: "-password" }
    );

    // Add verification warning if email changed
    const responseData: Record<string, any> = {
      success: true,
      user: updatedUser
    };

    if (email !== currentUser.email) {
      responseData.message = "Verification email sent to new address";
    }

    return NextResponse.json(responseData);

  } catch (error) {
    console.error("Settings update error:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    
    const user = await User.findOne({ email: session.user.email })
      .select('-password -resetToken -resetTokenExpiry')
      .lean();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
    
  } catch (error) {
    console.error("Settings fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
} 