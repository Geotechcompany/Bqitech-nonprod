import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const disqualified = await prisma.application.findMany({
      where: {
        disqualifiedDate: { not: null }
      },
      select: {
        id: true,
        name: true,
        email: true,
        position: true,
        disqualifiedDate: true,
        disqualifiedReason: true
      }
    });
    return NextResponse.json(disqualified);
  } catch (error) {
    console.error('Error fetching disqualified candidates:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
