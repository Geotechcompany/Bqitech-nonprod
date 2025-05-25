import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { Application } from '@/models/application';

export async function GET() {
  try {
    await connectToDatabase();
    
    const applications = await Application.find({
      $or: [
        { answers: { $exists: false } },
        { answers: { $size: 0 } }
      ]
    }).lean();

    const transformed = applications.map(app => ({
      id: app._id.toString(),
      name: app.name,
      email: app.email,
      position: app.position,
      status: app.status,
      appliedDate: app.appliedDate,
      cvUrl: app.resumeUrl || '',
      experience: app.experience,
      location: app.location,
      salary: app.salary,
      hearAbout: app.hearAbout,
      cotsExperience: app.cotsExperience,
      sqlJavaScriptExperience: app.sqlJavaScriptExperience,
      reportDevelopmentExperience: app.reportDevelopmentExperience
    }));

    return NextResponse.json(transformed);
  } catch (error) {
    console.error('Failed to fetch old applications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch old applications' },
      { status: 500 }
    );
  }
} 