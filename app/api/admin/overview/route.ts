import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { Application } from '@/models/application';

export async function GET() {
  try {
    const { db } = await connectToDatabase();
    
    const stats = await db.collection('applications').aggregate([
      {
        $match: {
          answers: { $exists: true, $not: { $size: 0 } }
        }
      },
      {
        $facet: {
          totalApplications: [{ $count: "count" }],
          shortlisted: [{ $match: { status: 'Shortlisted' } }, { $count: "count" }],
          technical: [{ $match: { status: 'Technical Assessment' } }, { $count: "count" }],
          interviewing: [{ $match: { status: 'Interviewing' } }, { $count: "count" }],
          hired: [{ $match: { status: 'Hired' } }, { $count: "count" }],
          disqualified: [{ $match: { status: 'Disqualified' } }, { $count: "count" }]
        }
      }
    ]).toArray();

    const result = {
      totalApplications: stats[0].totalApplications[0]?.count || 0,
      shortlisted: stats[0].shortlisted[0]?.count || 0,
      technicalAssessment: stats[0].technical[0]?.count || 0,
      interviewing: stats[0].interviewing[0]?.count || 0,
      hired: stats[0].hired[0]?.count || 0,
      disqualified: stats[0].disqualified[0]?.count || 0
    };

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 }
    );
  }
}
