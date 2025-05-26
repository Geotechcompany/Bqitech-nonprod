import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { Application } from '@/models/application';

export async function GET() {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    const shortlisted = await Application.find({ 
      status: 'Shortlisted'
    })
    .select('id name email position shortlistedDate status')
    .lean();
    
    return NextResponse.json(shortlisted);
  } catch (error) {
    console.error('Error fetching shortlisted candidates:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  } finally {
    await mongoose.disconnect();
  }
}
