import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { Application } from '@/models/application';

export async function GET() {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);

    const assessments = await Application.find({ 
      status: 'Technical Assessment'
    })
    .select('id name email position assessmentDate assessmentScore')
    .lean();

    return NextResponse.json(assessments);
  } catch (error) {
    console.error('Error fetching technical assessments:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  } finally {
    await mongoose.disconnect();
  }
}
