import { NextResponse } from "next/server";
import mongoose from 'mongoose';
import { JobPosting } from '@/models/jobPosting';

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
    await mongoose.connect(process.env.MONGODB_URI!);
    await updateSchema();
    
    const jobPostings = await JobPosting.find().lean();
    return NextResponse.json(jobPostings);
  } catch (error) {
    console.error("Failed to fetch job postings:", error);
    return NextResponse.json(
      { error: "Failed to fetch job postings" },
      { status: 500 }
    );
  } finally {
    await mongoose.disconnect();
  }
}

export async function POST(request: Request) {
  try {
    const jobData = await request.json();
    await mongoose.connect(process.env.MONGODB_URI!);
    await updateSchema();

    // Sanitize and prepare the data
    const sanitizedData = {
      title: jobData.title,
      department: jobData.department || "",
      location: jobData.location,
      description: jobData.description,
      postedDate: new Date(),
      employmentType: jobData.employmentType || "Full-time",
      category: jobData.category || "",
      isActive: true,
      salary: jobData.salary || null,
      // Ensure requirements is always an array of strings
      requirements: Array.isArray(jobData.requirements) 
        ? jobData.requirements.map(req => String(req))
        : [],
      questions: Array.isArray(jobData.questions) 
        ? jobData.questions.map(q => new mongoose.Types.ObjectId(q))
        : [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const newJobPosting = await JobPosting.create(sanitizedData);
    return NextResponse.json(newJobPosting, { status: 201 });
  } catch (error) {
    console.error("Failed to create job posting:", error);
    return NextResponse.json(
      { error: "Failed to create job posting" },
      { status: 500 }
    );
  } finally {
    await mongoose.disconnect();
  }
}
