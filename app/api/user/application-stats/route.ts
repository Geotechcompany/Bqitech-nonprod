import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import mongoose from 'mongoose';
import { User } from '@/models/user';
import { Application } from '@/models/application';
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    // Get applications using the same logic as the main applications endpoint
    const applications = await Application.aggregate([
      {
        $match: {
          "answers": {
            $elemMatch: {
              "questionText": { $regex: /^email$/i },
              "answer": session.user.email
            }
          }
        }
      },
      {
        $project: {
          status: 1,
          shortlistedDate: 1,
          assessmentDate: 1,
          interviewDate: 1,
          hireDate: 1,
          disqualifiedDate: 1
        }
      }
    ]);

    const stats = {
      totalApplications: applications.length,
      shortlisted: applications.filter(app => app.status === "Shortlisted").length,
      technicalAssessment: applications.filter(app => app.status === "Technical Assessment").length,
      interviewing: applications.filter(app => app.status === "Interviewing").length,
      hired: applications.filter(app => app.status === "Hired").length,
      disqualified: applications.filter(app => app.status === "Disqualified").length,
    };

    return NextResponse.json({ stats });
  } catch (error) {
    console.error('Error fetching application stats:', error);
    return NextResponse.json(
      { error: "Internal Server Error" }, 
      { status: 500 }
    );
  }
}
