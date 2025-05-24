import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectToDatabase from '@/lib/mongodb';
import { JobPosting } from "@/prisma/mongodb-schema";

// Add type definition for the questions array
type JobQuestion = {
  id: string;
  text: string;
  type: string;
  required: boolean;
  options?: string[];
};

// Update type definitions
type PopulatedJobPosting = {
  _id: mongoose.Types.ObjectId;
  questions: mongoose.Document<unknown>[];
};

export async function GET(request: Request, { params }: { params: { id: string } }) {
  await connectToDatabase();

  // Add ObjectID validation
  if (!mongoose.Types.ObjectId.isValid(params.id)) {
    return NextResponse.json(
      { success: false, error: 'Invalid job ID format' },
      { status: 400 }
    );
  }

  try {
    // Use JobPosting model instead of Job
    const job = await JobPosting.findById(params.id)
      .populate('questions')  // Populate linked questions
      .select('questions')
      .lean() as unknown as PopulatedJobPosting;

    if (!job) {
      return NextResponse.json(
        { success: false, error: 'Job not found' },
        { status: 404 }
      );
    }

    // Update question mapping with proper typing
    const transformedQuestions = job.questions.map(question => ({
      id: (question as any)._id.toString(),
      text: (question as any).question,
      type: (question as any).type,
      required: (question as any).required,
      options: (question as any).options
    }));

    return NextResponse.json({
      success: true,
      questions: transformedQuestions
    });

  } catch (error) {
    console.error('Failed to fetch questions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch questions' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic'; 