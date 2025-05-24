import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { JobPosting } from '@/models/jobPosting';

export async function GET() {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    
    const jobPostings = await JobPosting.find()
      .sort({ postedDate: -1 }) // -1 for descending order
      .lean();

    // Compact description whitespace
    const compactedPostings = jobPostings.map(posting => ({
      ...posting,
      description: posting.description
        ?.replace(/&nbsp;|[\s\u00A0]+/g, ' ') // Replace both &nbsp; entities and whitespace
        ?.replace(/(<\/p>)[\s\u00A0]*(<p)/gi, '$1$2') // Clean between paragraphs
        ?.trim()
        ?.replace(/\s{2,}/g, ' ') // Final cleanup for multiple spaces
    }));

    return NextResponse.json(compactedPostings);
  } catch (error) {
    console.error('Failed to fetch job postings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch job postings' }, 
      { status: 500 }
    );
  } finally {
    await mongoose.disconnect();
  }
}