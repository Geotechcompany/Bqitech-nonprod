import { getServerSession } from "next-auth";
import { NextResponse, NextRequest } from "next/server";
import { addAdmin, removeAdmin } from "@/lib/admin-management";
import { authOptions } from "@/lib/auth";
import mongoose from "mongoose";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if user is super admin
    const user = await mongoose.model('User').findOne({ email: session.user.email });
    const isSuperAdmin = user?.role === 'SUPER_ADMIN';

    if (!isSuperAdmin) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { targetUserId, action } = await req.json();

    if (action === "add") {
      await addAdmin(targetUserId);
    } else if (action === "remove") {
      await removeAdmin(targetUserId);
    } else {
      return NextResponse.json(
        { error: "Invalid action" },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin management error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 