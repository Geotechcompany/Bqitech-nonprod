import { getAuth } from "@clerk/nextjs/server";
import { NextResponse, NextRequest } from "next/server";
import { addAdmin, removeAdmin } from "@/lib/admin-management";

export async function POST(req: NextRequest) {
  try {
    const { userId, sessionClaims } = getAuth(req);
    const { targetUserId, action } = await req.json();

    // Ensure sessionClaims is typed correctly
    const publicMetadata = sessionClaims?.publicMetadata as { isSuperAdmin?: boolean };

    // Check if the current user is a super admin
    const isSuperAdmin = publicMetadata?.isSuperAdmin === true;

    if (!userId || !isSuperAdmin) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

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