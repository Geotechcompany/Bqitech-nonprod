import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { Application } from '@/models/application';
import { Job } from '@/models/job';

export async function GET() {
  try {
    const { db } = await connectToDatabase();
    
    // Verify connection state before proceeding
    if (!db) throw new Error('Database not connected');

    // Use parallel queries for better performance
    const [applications, jobs] = await Promise.all([
      db.collection('applications').find({
        status: 'Shortlisted',
        answers: { $exists: true, $not: { $size: 0 } }
      }).toArray(),
      
      db.collection('jobs').find({})
        .project({ _id: 1, title: 1 })
        .toArray()
    ]);

    const jobTitleMap = new Map(jobs.map(job => [job._id.toString(), job.title]));

    // Add error handling for data transformation
    const transformed = applications.map(app => {
      try {
        return {
          id: app._id?.toString(),
          name: app.name || `${getAnswer(app.answers, 'First Name')} ${getAnswer(app.answers, 'Last Name')}`.trim(),
          email: app.email,
          position: app.position || jobTitleMap.get(app.jobId?.toString()) || 'No position specified',
          status: app.status,
          shortlistedDate: app.shortlistedDate,
          cvUrl: app.cvUrl || app.resumeUrl || '',
          answers: validateAnswers(app.answers) || transformLegacyFields(app)
        };
      } catch (transformError) {
        console.error('Data transformation error:', transformError);
        return null;
      }
    }).filter(Boolean);

    return NextResponse.json(transformed);
  } catch (error) {
    console.error('[SHORTLISTED] Database error:', error);
    return NextResponse.json(
      { error: 'Database operation failed' },
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

// Add validation helper
function validateAnswers(answers: any) {
  return Array.isArray(answers) && answers.length > 0 ? answers : null;
}
