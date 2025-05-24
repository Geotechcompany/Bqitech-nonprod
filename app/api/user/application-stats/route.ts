import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import mongoose from 'mongoose';
import { User } from '@/models/user';
import { Application } from '@/models/application';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Get authenticated user from NextAuth
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    await mongoose.connect(process.env.MONGODB_URI!);

    // Find user by email
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    const applications = await Application.find({ userId: user._id });

    const stats = {
      totalApplications: applications.length,
      shortlisted: applications.filter(app => app.shortlistedDate !== null).length,
      technicalAssessment: applications.filter(app => app.assessmentDate !== null).length,
      interviewing: applications.filter(app => app.interviewDate !== null).length,
      hired: applications.filter(app => app.hireDate !== null).length,
      disqualified: applications.filter(app => app.disqualifiedDate !== null).length,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching application stats:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  } finally {
    await mongoose.disconnect();
  }
}
