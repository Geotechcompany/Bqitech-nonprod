import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import mongoose from "mongoose";
import connectToDatabase from "@/lib/mongodb";
import { Application } from "@/models/application";
import { auth } from "@clerk/nextjs/server";
import { JobPosting } from "@/models/jobPosting";
import { IJobPosting } from "@/interfaces/jobPosting";

const prisma = new PrismaClient();

export async function GET() {
  await connectToDatabase();

  try {
    const { userId } = await auth();
    
    // Add your admin check logic here
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" }, 
        { status: 401 }
      );
    }

    // Option 1: Use virtual population
    const applications = await Application.find()
      .populate('jobDetails', 'title')
      .select('name email jobId')
      .lean();

    // Option 2: Use manual population with explicit typing
    // const applications = await Application.find()
    //   .populate<{ jobId: IJobPosting }>('jobId', 'title')
    //   .select('name email jobId')
    //   .lean();

    return NextResponse.json({
      applications: applications.map(app => ({
        ...app,
        id: app._id.toString(),
        _id: undefined,
        position: app.jobId?.title || 'N/A'
      }))
    });

  } catch (error) {
    console.error("Error fetching applications:", error);
    return NextResponse.json(
      { error: "Internal Server Error" }, 
      { status: 500 }
    );
  }
}
