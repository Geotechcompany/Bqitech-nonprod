import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { JobPosting } from "@/models/jobPosting";
import { connectToDatabase } from "@/lib/mongodb";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { db } = await connectToDatabase();
    
    const jobs = await db.collection('jobpostings').find()
      .project({ _id: 1, title: 1 })
      .toArray();

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
    const { db } = await connectToDatabase();
    const body = await request.json();
    
    const result = await db.collection('jobpostings').insertOne(body);
    
    if (!result.acknowledged) {
      throw new Error('Failed to create job');
    }
    
    return NextResponse.json({ 
      _id: result.insertedId,
      ...body
    });
  } catch (error) {
    console.error("Failed to create job:", error);
    return NextResponse.json(
      { error: "Failed to create job" },
      { status: 500 }
    );
  }
} 