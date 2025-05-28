import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { Application } from '@/models/application';
import { Job } from '@/models/job';

export async function GET() {
  try {
    await connectToDatabase();
    
    const applications = await Application.find({ 
      status: 'Interviewing',
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
      interviewDate: app.interviewDate,
      interviewer: app.interviewer,
      cvUrl: app.cvUrl || app.resumeUrl || '',
      answers: Array.isArray(app.answers) && app.answers.length > 0 
        ? app.answers 
        : transformLegacyFields(app),
    }));

    return NextResponse.json(transformed);
  } catch (error) {
    console.error('Failed to fetch interviewing candidates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch interviewing candidates' },
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


