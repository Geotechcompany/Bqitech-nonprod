import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { Application } from '@/models/application';
import { Job } from '@/models/job';

export async function GET() {
  try {
    await connectToDatabase();
    
    const applications = await Application.find({
      answers: { $exists: true, $not: { $size: 0 } }
    })
    .populate({
      path: 'jobId',
      select: 'title',
      model: Job
    })
    .lean();

    const transformed = applications.map(app => ({
      id: app._id.toString(),
      name: app.name || `${getAnswer(app.answers, 'First Name')} ${getAnswer(app.answers, 'Last Name')}`.trim(),
      email: app.email,
      position: app.position || app.jobId?.title || 'No position specified',
      status: app.status,
      appliedDate: app.appliedDate,
      cvUrl: app.cvUrl || app.resumeUrl || '',
      answers: Array.isArray(app.answers) && app.answers.length > 0 
        ? app.answers 
        : transformLegacyFields(app),
      ...(app.experience && { experience: app.experience }),
      ...(app.location && { location: app.location })
    }));

    return NextResponse.json(transformed);
  } catch (error) {
    console.error('Failed to fetch applications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    );
  }
}

function getAnswer(answers: Array<{questionText: string, answer: string}>, question: string): string {
  return answers?.find(a => a.questionText === question)?.answer || '';
}

function transformLegacyFields(app: any): Array<{questionText: string, answer: string}> {
  return [
    { questionText: 'Experience', answer: app.experience },
    { questionText: 'Location', answer: app.location },
    { questionText: 'Salary Expectation', answer: app.salary },
    { questionText: 'Hear About Us', answer: app.hearAbout }
  ].filter(field => field.answer);
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
