import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { isActive } = await request.json();

    const updatedJob = await prisma.jobPosting.update({
      where: { id: params.id },
      data: { isActive },
    });

    return NextResponse.json(updatedJob);
  } catch (error) {
    console.error('Failed to update job status:', error);
    return NextResponse.json(
      { error: 'Failed to update job status' },
      { status: 500 }
    );
  }
} 