import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectToDatabase } from '@/lib/mongodb';
import { JobQuestion } from '@/models/job-question';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

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

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Ensure connection is established
    await connectToDatabase();

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { error: 'Invalid job ID' },
        { status: 400 }
      );
    }

    const questions = await JobQuestion.find({ 
      jobIds: new mongoose.Types.ObjectId(params.id) 
    }).exec();

    return NextResponse.json(questions);
  } catch (error) {
    console.error('Failed to fetch questions:', error);
    return NextResponse.json(
      { 
        message: 'Failed to fetch questions',
        error: process.env.NODE_ENV === 'development' ? error.message : null
      },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic'; 