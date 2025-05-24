import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { JobPosting } from '@/models/jobPosting';
import { JobQuestion } from '@/models/job-question';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';

export async function GET() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectToDatabase();

    const jobs = await JobPosting.find()
      .select('_id title questions')
      .populate('questions', 'question type')
      .lean();

    const associations = jobs.map(job => ({
      jobId: job._id,
      jobTitle: job.title,
      questions: job.questions.map(question => ({
        questionId: question._id,
        text: question.question,
        type: question.type
      }))
    }));

    return NextResponse.json(associations);

  } catch (error) {
    console.error('Failed to fetch job-question associations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch job-question associations' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { questionId, jobIds } = await req.json();
    await connectToDatabase();
    
    // Validate inputs
    if (!questionId || !jobIds || !Array.isArray(jobIds)) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    // Update question with new job associations
    await JobQuestion.findByIdAndUpdate(questionId, {
      jobIds,
      updatedAt: new Date()
    });

    // Update jobs with the new question
    await JobPosting.updateMany(
      { _id: { $in: jobIds } },
      { $addToSet: { questions: questionId } }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update job associations:', error);
    return NextResponse.json(
      { error: 'Failed to update job associations' },
      { status: 500 }
    );
  }
} 