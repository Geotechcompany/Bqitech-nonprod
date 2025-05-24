import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { JobPosting } from '@/models/jobPosting';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    
    const jobPosting = await JobPosting.findById(params.id).lean();
    
    if (!jobPosting) {
      return NextResponse.json({ error: 'Job posting not found' }, { status: 404 });
    }
    return NextResponse.json(jobPosting);
  } catch (error) {
    console.error('Failed to fetch job posting:', error);
    return NextResponse.json({ error: 'Failed to fetch job posting' }, { status: 500 });
  } finally {
    await mongoose.disconnect();
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const data = await request.json();
    await mongoose.connect(process.env.MONGODB_URI!);
    
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
  } finally {
    await mongoose.disconnect();
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    const deletedJob = await JobPosting.findByIdAndDelete(params.id);
    
    if (!deletedJob) {
      return NextResponse.json({ error: 'Job posting not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Job posting deleted successfully' });
  } catch (error) {
    console.error('Failed to delete job posting:', error);
    return NextResponse.json({ error: 'Failed to delete job posting' }, { status: 500 });
  } finally {
    await mongoose.disconnect();
  }
}
