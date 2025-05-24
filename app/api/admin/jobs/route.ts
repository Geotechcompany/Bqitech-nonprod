import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { JobPosting } from "@/prisma/mongodb-schema";
import mongoose from "mongoose";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const jobs = await prisma.jobPosting.findMany({
      select: {
        id: true,
        title: true
      }
    });
    
    return NextResponse.json(jobs);
  } catch (error) {
    console.error("Failed to fetch jobs:", error);
    return NextResponse.json(
      { error: "Failed to fetch jobs" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    await connectToDatabase();
    if (mongoose.connection.readyState !== 1) {
      throw new Error('Database connection not established');
    }

    const job = await JobPosting.create(body);
    return NextResponse.json(job);
  } catch (error) {
    console.error("Failed to create job:", error);
    return NextResponse.json(
      { 
        error: "Failed to create job",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 