import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { JobPosting } from '@/prisma/mongodb-schema';
import type { IJobPosting } from '@/prisma/mongodb-schema';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    const jobPosting = await JobPosting.findById(params.id).lean();
    
    if (!jobPosting) {
      return NextResponse.json({ error: 'Job posting not found' }, { status: 404 });
    }
    return NextResponse.json(jobPosting);
  } catch (error) {
    console.error('Failed to fetch job posting:', error);
    return NextResponse.json({ error: 'Failed to fetch job posting' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const data = await request.json();
    await connectToDatabase();
    
    // Sanitize the update data
    const updateData = {
      title: data.title,
      department: data.department || "",
      location: data.location,
      description: data.description,
      employmentType: data.employmentType || "Full-time",
      category: data.category || "",
      isActive: typeof data.isActive === 'boolean' ? data.isActive : true,
      salary: data.salary || null,
      // Ensure requirements is always an array of strings
      requirements: Array.isArray(data.requirements) 
        ? data.requirements.map(req => String(req))
        : [],
      updatedAt: new Date()
    };

    const updatedJobPosting = await JobPosting.findByIdAndUpdate(
      params.id,
      { $set: updateData },
      { 
        new: true, 
        runValidators: true,
        upsert: true
      }
    );

    return NextResponse.json(updatedJobPosting);
  } catch (error) {
    console.error('Failed to update job posting:', error);
    return NextResponse.json({ error: 'Failed to update job posting' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    const deletedJob = await JobPosting.findByIdAndDelete(params.id);
    
    if (!deletedJob) {
      return NextResponse.json({ error: 'Job posting not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Job posting deleted successfully' });
  } catch (error) {
    console.error('Failed to delete job posting:', error);
    return NextResponse.json({ error: 'Failed to delete job posting' }, { status: 500 });
  }
}
