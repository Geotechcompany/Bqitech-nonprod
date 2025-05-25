import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema({
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'JobPosting', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['PENDING', 'REVIEWED', 'ACCEPTED', 'REJECTED'], default: 'PENDING' },
  answers: [{
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'JobQuestion' },
    answer: String
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Application = mongoose.models.Application || mongoose.model('Application', applicationSchema);

export async function GET() {
  try {
    await connectToDatabase();
    
    const applications = await Application.find()
      .populate({
        path: 'jobId',
        select: 'title location salaryRange'
      })
      .populate({
        path: 'applicantId',
        select: 'name email'
      });

    return NextResponse.json(applications);
  } catch (error) {
    console.error('Failed to fetch applications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    await connectToDatabase();
    
    const application = await Application.create({
      ...body,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    return NextResponse.json(application, { status: 201 });
  } catch (error) {
    console.error('Failed to create application:', error);
    return NextResponse.json(
      { error: 'Failed to create application' },
      { status: 500 }
    );
  }
}
