import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { JobPosting } from '@/models/jobPosting';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    
    const { isActive } = await request.json();

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