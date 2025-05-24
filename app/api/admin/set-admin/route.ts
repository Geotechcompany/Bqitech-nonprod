import { clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();
    
    // Update user metadata to set admin role
    const clerk = await clerkClient();
    await clerk.users.updateUser(userId, {
      publicMetadata: { role: "admin" },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error setting admin role:", error);
    return NextResponse.json({ error: "Failed to set admin role" }, { status: 500 });
  }
} 