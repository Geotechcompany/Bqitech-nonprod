import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { db } = await connectToDatabase();
    
    const pipeline = [
      { 
        $match: { 
          "user.email": session.user.email,
          status: { $exists: true, $in: ["applied", "shortlisted", "technicalAssessment", "interviewing", "hired", "disqualified"] }
        } 
      },
      { 
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          latestDate: { $max: "$appliedDate" }
        }
      },
      {
        $project: {
          status: "$_id",
          count: 1,
          _id: 0
        }
      }
    ];

    const statusData = await db.collection('applications')
      .aggregate(pipeline)
      .toArray();

    // Get latest application status
    const latestApplication = await db.collection('applications')
      .findOne(
        { 
          "user.email": session.user.email,
          status: { $exists: true }
        },
        { 
          sort: { appliedDate: -1 },
          projection: { status: 1 }
        }
      );

    const statusCounts = statusData.reduce((acc, curr) => {
      acc[curr.status] = curr.count;
      return acc;
    }, {});

    // Get user's plan limits (example - adjust based on your schema)
    const user = await db.collection('users').findOne({ 
      email: session.user.email 
    }, {
      projection: { planSlots: 1 }
    });

    // Validate and normalize status
    const validStatuses = ['applied', 'shortlisted', 'technicalAssessment', 'interviewing', 'hired', 'disqualified'];
    const currentStage = validStatuses.includes(latestApplication?.status) 
      ? latestApplication.status 
      : 'applied';

    return NextResponse.json({
      used: statusData.reduce((sum, curr) => sum + curr.count, 0),
      total: user?.planSlots || 5,
      statusCounts,
      currentStage
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch slot data' },
      { status: 500 }
    );
  }
} 