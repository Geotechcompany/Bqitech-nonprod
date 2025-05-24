import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const shortlisted = await prisma.application.findMany({
      where: {
        shortlistedDate: { not: null }
      },
      select: {
        id: true,
        name: true,
        email: true,
        position: true,
        shortlistedDate: true
      }
    });
    return NextResponse.json(shortlisted);
  } catch (error) {
    console.error('Error fetching shortlisted candidates:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
