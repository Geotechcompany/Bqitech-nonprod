import { NextRequest, NextResponse } from "next/server";
import { getSession } from "next-auth/react";
import { connectToDatabase } from "@/lib/mongodb";
import { sendPasswordResetEmail } from "@/lib/email";
import { ObjectId } from "mongodb";
import { randomBytes } from "crypto";

export async function POST(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  const session = await getSession();
  
  if (!session || session.user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const { db } = await connectToDatabase();
    const user = await db.collection("users").findOne({ 
      _id: new ObjectId(params.userId) 
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Generate reset token and send email
    const resetToken = randomBytes(20).toString('hex');
    const resetExpires = new Date(Date.now() + 3600000); // 1 hour
    
    await db.collection("users").updateOne(
      { _id: new ObjectId(params.userId) },
      { $set: { resetToken, resetExpires } }
    );

    await sendPasswordResetEmail(user.email, resetToken);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Password reset failed:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
} 