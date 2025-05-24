import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { JobPosting } from "@/models/jobPosting";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);

    const jobs = await JobPosting.find()
      .select('_id title')
      .lean();
    
    return NextResponse.json(jobs);
  } catch (error) {
    console.error("Failed to fetch jobs:", error);
    return NextResponse.json(
      { error: "Failed to fetch jobs" },
      { status: 500 }
    );
  } finally {
    await mongoose.disconnect();
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    await mongoose.connect(process.env.MONGODB_URI!);

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
  } finally {
    await mongoose.disconnect();
  }
} 