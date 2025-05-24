import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { Application } from '@/models/application';

export async function GET() {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    const hired = await Application.find({ status: 'Hired' })
      .select('id name email position appliedDate status hireDate startDate')
      .lean();
    
    return NextResponse.json({ applications: hired });
  } catch (error) {
    console.error('Error fetching hired candidates:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  } finally {
    await mongoose.disconnect();
  }
}
