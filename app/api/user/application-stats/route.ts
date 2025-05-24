import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    });

    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    const applications = await prisma.application.findMany({
      where: { userId: user.id }
    });

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
    await prisma.$disconnect();
  }
}
