import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const assessments = await prisma.application.findMany({
      where: {
        assessmentDate: { not: null }
      },
      select: {
        id: true,
        name: true,
        email: true,
        position: true,
        assessmentDate: true,
        assessmentScore: true
      }
    });
    return NextResponse.json(assessments);
  } catch (error) {
    console.error('Error fetching technical assessments:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
