import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { JobPosting } from '@/models/jobPosting';
import { JobQuestion } from '@/models/jobQuestion';
import mongoose from 'mongoose';
import { z } from 'zod';

interface IQuestionResponse {
  _id: string;
  id: string;
  question: string;
  type: string;
  required: boolean;
  options: string[];
  jobIds: string[];
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

// Add interface for lean document
interface IQuestionDocument {
  _id: mongoose.Types.ObjectId;
  question: string;
  type: string;
  required: boolean;
  options: string[];
  order: number;
  jobId?: mongoose.Types.ObjectId;
}

// Instead of extending, create a new interface
interface IPopulatedQuestion {
  _id: mongoose.Types.ObjectId;
  question: string;
  type: string;
  required: boolean;
  options: string[];
  order: number;
  jobId?: {
    _id: mongoose.Types.ObjectId;
    title: string;
  };
}

// Update the return type for populated question
interface IPopulatedQuestionResponse extends mongoose.Document {
  _id: mongoose.Types.ObjectId;
  question: string;
  type: string;
  required: boolean;
  options: string[];
  jobId?: {
    _id: mongoose.Types.ObjectId;
    title: string;
  };
}

const questionSchema = z.object({
  jobId: z.string().refine(val => {
    const trimmed = val.trim();
    return mongoose.isValidObjectId(trimmed);
  }, "Invalid job ID format")
});

export async function GET() {
  try {
    await connectToDatabase();
    
    const questions = await JobQuestion.find()
      .populate({
        path: 'jobIds',
        select: 'title',
        model: 'JobPosting'
      })
      .sort({ order: 1 })
      .lean();

    const transformedQuestions = questions.map(question => ({
      ...question,
      id: question._id.toString(),
      jobTitles: (question.jobIds || []).map(job => job?.title).filter(Boolean),
      jobIds: (question.jobIds || []).map(id => id.toString())
    }));
    
    return NextResponse.json(transformedQuestions);
  } catch (error) {
    console.error("Failed to fetch questions:", error);
    return NextResponse.json(
      { error: "Failed to fetch questions" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Add type-specific validation
    if (['select', 'radio'].includes(body.type) && (!body.options || body.options.length === 0)) {
      return NextResponse.json(
        { error: "Options are required for this question type" },
        { status: 400 }
      );
    }
    
    if (body.type === 'boolean') {
      body.options = ['Yes', 'No']; // Force boolean options
    }

    // Validate request body
    if (!body.question?.trim()) {
      return NextResponse.json(
        { error: "Question text is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();
    
    // Get all job IDs if availableForAllJobs is true
    const jobId = (body.jobIds || []).map(id => id.trim());
    const validJobIds = jobId
      .filter((id: string) => mongoose.Types.ObjectId.isValid(id))
      .map(id => new mongoose.Types.ObjectId(id));

    // Create question
    const question = await JobQuestion.create({
      question: body.question,
      type: body.type,
      options: body.options || [],
      required: body.required || false,
      order: body.order || 0,
      jobIds: validJobIds,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Update all associated jobs
    if (validJobIds.length > 0) {
      await JobPosting.updateMany(
        { _id: { $in: validJobIds } },
        { $addToSet: { questions: question._id } }
      );
    }

    return NextResponse.json({
      ...question.toObject(),
      id: question._id.toString(),
      jobIds: validJobIds.map(id => id.toString())
    });
  } catch (error) {
    console.error("Failed to create question:", error);
    return NextResponse.json(
      { error: "Failed to create question" },
      { status: 500 }
    );
  }
} 