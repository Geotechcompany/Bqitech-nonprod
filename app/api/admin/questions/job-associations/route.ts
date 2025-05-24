import { NextResponse, NextRequest } from 'next/server';
import mongoose from 'mongoose';
import { getAuth } from '@clerk/nextjs/server';
import { JobQuestion } from '@/prisma/mongodb-schema';

export async function GET(req: NextRequest) {
  const { userId } = getAuth(req);
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI!, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000
    });

    if (mongoose.connection.readyState !== 1) {
      throw new Error('Database connection not established');
    }
    
    const questions = await JobQuestion.find()
      .populate({
        path: 'jobIds',
        select: 'title',
        model: 'JobPosting'
      })
      .lean();

    const associations = questions.map(question => ({
      questionId: question._id.toString(),
      jobTitles: (question.jobIds || [])
        .filter(job => job?.title)
        .map(job => job.title)
    }));

    return NextResponse.json(associations);

  } catch (error) {
    console.error('Job associations fetch failed:', error);
    return NextResponse.json(
      { error: 'Failed to fetch job associations' },
      { status: 500 }
    );
  } finally {
    await mongoose.disconnect();
  }
} 