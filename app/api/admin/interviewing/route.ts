import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const interviewing = await prisma.application.findMany({
      where: {
        status: 'Interviewing'
      },
      select: {
        id: true,
        name: true,
        email: true,
        position: true,
        interviewDate: true,
        interviewer: true,
        status: true
      }
    });
    
    return NextResponse.json({ applications: interviewing });
  } catch (error) {
    console.error('Error fetching interviewing candidates:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
  
}


