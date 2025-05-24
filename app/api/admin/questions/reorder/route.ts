import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { JobQuestion } from "@/prisma/mongodb-schema";

export const dynamic = 'force-dynamic';

export async function PUT(request: Request) {
  try {
    const { updates } = await request.json();
    await connectToDatabase();
    
    if (!updates || !Array.isArray(updates)) {
      return NextResponse.json(
        { error: "Invalid updates format" },
        { status: 400 }
      );
    }
    
    // Process updates sequentially
    for (const update of updates) {
      await JobQuestion.findByIdAndUpdate(update.id, {
        order: update.order
      });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to reorder questions:", error);
    return NextResponse.json(
      { error: "Failed to reorder questions" },
      { status: 500 }
    );
  }
} 