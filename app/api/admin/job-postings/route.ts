import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { JobPosting } from "@/models/jobPosting";
import mongoose from "mongoose";

// Ensure schema has all required fields
const updateSchema = async () => {
  const jobPostingSchema = JobPosting.schema;
  
  const requiredFields = {
    title: { type: String, required: true },
    department: { type: String, default: "" },
    location: { type: String, required: true },
    description: { type: String, required: true },
    postedDate: { type: Date, default: Date.now },
    employmentType: { type: String, default: "Full-time" },
    category: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
    salary: {
      type: {
        currency: { type: String, default: "KES" },
        min: Number,
        max: Number
      },
      default: null
    },
    requirements: { type: [String], default: [] },
    questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'JobQuestion' }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  };

  // Add any missing fields to schema
  Object.entries(requiredFields).forEach(([field, schema]) => {
    if (!jobPostingSchema.paths[field]) {
      jobPostingSchema.add({ [field]: schema });
    }
  });

  // Update collection with new schema
  try {
    await JobPosting.syncIndexes();
  } catch (error) {
    console.error('Error syncing indexes:', error);
  }
};

export async function GET() {
  try {
    await connectToDatabase();
    const jobPostings = await JobPosting.find().sort({ postedDate: -1 });
    return NextResponse.json(jobPostings);
  } catch (error) {
    console.error("Failed to fetch job postings:", error);
    return NextResponse.json(
      { error: "Failed to fetch job postings" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    await connectToDatabase();
    
    const jobPosting = await JobPosting.create({
      ...body,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    return NextResponse.json(jobPosting, { status: 201 });
  } catch (error) {
    console.error("Failed to create job posting:", error);
    return NextResponse.json(
      { error: "Failed to create job posting" },
      { status: 500 }
    );
  }
}
