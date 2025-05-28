import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { JobPosting } from '@/models/jobPosting';
import { isValidObjectId } from 'mongoose';

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    
    // Validate ID before any operations
    if (!params?.id || !isValidObjectId(params.id)) {
      return NextResponse.json(
        { error: "Invalid or missing job posting ID" },
        { status: 400 }
      );
    }

    const { isActive } = await req.json();

    const updatedJob = await JobPosting.findByIdAndUpdate(
      params.id,
      { isActive },
      { new: true }
    );

    if (!updatedJob) {
      return NextResponse.json(
        { error: 'Job posting not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedJob);
  } catch (error) {
    console.error('Failed to update job status:', error);
    return NextResponse.json(
      { error: 'Failed to update job status' },
      { status: 500 }
    );
  } finally {
    await mongoose.disconnect();
  }
} 