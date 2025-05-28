import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import mongoose from 'mongoose';
import { JobQuestion } from '@/models/job-question';
import { JobPosting } from '@/models/jobPosting';

export const dynamic = 'force-dynamic';

// Add interface for populated response
interface PopulatedQuestion {
  _id: mongoose.Types.ObjectId;
  jobIds: Array<{ _id: mongoose.Types.ObjectId; title: string }>;
  __v: number;
  question: string;
  type: string;
  required: boolean;
  options: string[];
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    const question = await JobQuestion.findById(params.id)
      .populate('jobIds', 'title _id')
      .lean();
    
    if (!question) {
      return NextResponse.json(
        { error: "Question not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(question);
  } catch (error) {
    console.error("Failed to fetch question:", error);
    return NextResponse.json(
      { error: "Failed to fetch question" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    
    // Ensure database connection
    await connectToDatabase();

    if (!params?.id || !mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { error: "Valid Question ID is required" },
        { status: 400 }
      );
    }

    // Validate first
    if (body.type === 'boolean') {
      body.options = ['Yes', 'No'];
    } else if (['select', 'radio'].includes(body.type)) {
      if (!body.options || body.options.length === 0) {
        return NextResponse.json(
          { error: "Options are required for this question type" },
          { status: 400 }
        );
      }
    }

    const validJobIds = body.jobIds
      ? body.jobIds
          .filter((id: string) => mongoose.Types.ObjectId.isValid(id))
          .map(id => new mongoose.Types.ObjectId(id))
      : [];

    const updateData = {
      question: body.question,
      type: body.type,
      required: body.required,
      options: body.type === 'boolean' ? ['Yes', 'No'] : body.options || [],
      jobIds: validJobIds,
      updatedAt: new Date()
    };

    const updatedQuestion = await JobQuestion.findByIdAndUpdate(
      params.id,
      { $set: updateData },
      { 
        new: true,
        runValidators: true 
      }
    ).populate('jobIds', '_id title');
    
    if (!updatedQuestion) {
      return NextResponse.json(
        { error: "Question not found" },
        { status: 404 }
      );
    }
    
    // Get previous and new job IDs
    const previousJobIds = updatedQuestion.jobIds.map(job => job._id.toString()) || [];
    const newJobIds = validJobIds.map(id => id.toString());

    // Find jobs to add and remove
    const jobsToAdd = newJobIds.filter(id => !previousJobIds.includes(id));
    const jobsToRemove = previousJobIds.filter(id => !newJobIds.includes(id));

    // Update job postings
    await JobPosting.updateMany(
      { _id: { $in: jobsToAdd } },
      { $addToSet: { questions: new mongoose.Types.ObjectId(params.id) } }
    );

    await JobPosting.updateMany(
      { _id: { $in: jobsToRemove } },
      { $pull: { questions: new mongoose.Types.ObjectId(params.id) } }
    );

    // Transform response
    const populatedQuestion = await JobQuestion.findById(params.id)
      .populate('jobIds', 'title')
      .lean() as unknown as PopulatedQuestion;

    const response = {
      ...populatedQuestion,
      id: populatedQuestion._id.toString(),
      jobIds: populatedQuestion.jobIds.map(job => job._id.toString()),
      jobTitles: populatedQuestion.jobIds.map(job => job.title)
    };

    delete response._id;
    delete response.__v;
    
    return NextResponse.json(response);
  } catch (error) {
    console.error("Failed to update question:", error);
    return NextResponse.json(
      { error: "Failed to update question" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    
    // Remove question from associated jobs
    await JobPosting.updateMany(
      { questions: params.id },
      { $pull: { questions: params.id } }
    );
    
    // Delete the question
    await JobQuestion.findByIdAndDelete(params.id);
    
    return NextResponse.json({ message: "Question deleted successfully" });
  } catch (error) {
    console.error("Failed to delete question:", error);
    return NextResponse.json(
      { error: "Failed to delete question" },
      { status: 500 }
    );
  }
} 