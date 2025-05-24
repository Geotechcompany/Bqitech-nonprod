import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { JobQuestion } from '@/models/job-question';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

export async function PUT(request: Request) {
  try {
    const { updates } = await request.json();
    
    // Validate input
    if (!updates || !Array.isArray(updates)) {
      return NextResponse.json(
        { error: "Invalid updates format" },
        { status: 400 }
      );
    }

    // Ensure database connection
    await connectToDatabase();

    // Validate all updates
    for (const update of updates) {
      if (!update.id || !mongoose.Types.ObjectId.isValid(update.id)) {
        return NextResponse.json(
          { error: "Invalid question ID in updates" },
          { status: 400 }
        );
      }
      if (typeof update.order !== 'number') {
        return NextResponse.json(
          { error: "Invalid order value in updates" },
          { status: 400 }
        );
      }
    }

    // Process updates in a transaction
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      for (const update of updates) {
        await JobQuestion.findByIdAndUpdate(
          update.id,
          { order: update.order },
          { session }
        );
      }
      
      await session.commitTransaction();
      session.endSession();
      
      return NextResponse.json({ success: true });
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  } catch (error) {
    console.error("Failed to reorder questions:", error);
    return NextResponse.json(
      { error: "Failed to reorder questions" },
      { status: 500 }
    );
  }
} 