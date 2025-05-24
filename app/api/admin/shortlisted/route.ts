import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { Application } from '@/models/application';

export async function GET() {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    const shortlisted = await Application.find({
      shortlistedDate: { $ne: null }
    })
    .select('id name email position shortlistedDate')
    .lean();
    
    return NextResponse.json(shortlisted);
  } catch (error) {
    console.error('Error fetching shortlisted candidates:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  } finally {
    await mongoose.disconnect();
  }
}
