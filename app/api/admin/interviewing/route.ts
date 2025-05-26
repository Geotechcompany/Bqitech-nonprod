import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { Application } from '@/models/application';

export async function GET() {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    const interviewing = await Application.find({ 
      status: 'Interviewing' // Explicit status filter
    })
    .select('id name email position interviewDate interviewer status')
    .lean();
    
    return NextResponse.json(interviewing); // Remove unnecessary nesting
  } catch (error) {
    console.error('Error fetching interviewing candidates:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  } finally {
    await mongoose.disconnect();
  }
}


