import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { Application } from '@/models/application';

export async function GET() {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    const disqualified = await Application.find({
      disqualifiedDate: { $ne: null }
    }).select('id name email position disqualifiedDate disqualifiedReason').lean();
    
    return NextResponse.json(disqualified);
  } catch (error) {
    console.error('Error fetching disqualified candidates:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  } finally {
    await mongoose.disconnect();
  }
}
