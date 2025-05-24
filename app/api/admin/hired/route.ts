import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const hired = await prisma.application.findMany({
      where: {
        status: 'Hired'
      },
      select: {
        id: true,
        name: true,
        email: true,
        position: true,
        appliedDate: true,
        status: true,
        hireDate: true,
        startDate: true
      }
    });
    return NextResponse.json({ applications: hired });
  } catch (error) {
    console.error('Error fetching hired candidates:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
