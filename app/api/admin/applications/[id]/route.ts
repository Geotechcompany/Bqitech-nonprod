import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { Application } from '@/models/application';
import mongoose from 'mongoose';
import { FlattenMaps } from 'mongoose';
import { ApplicationDocument } from '@/models/application';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  await connectToDatabase();
  
  try {
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: 'Invalid application ID' }, { status: 400 });
    }

    const application = await Application.findById(params.id).lean() as FlattenMaps<ApplicationDocument>;

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    return NextResponse.json({
      ...application,
      id: application._id.toString(),
      _id: undefined
    });
    
  } catch (error) {
    console.error('Error fetching application:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  await connectToDatabase();
  
  try {
    const body = await request.json();
    
    // Add status transition logic
    const updatePayload: Record<string, any> = {
      ...body,
      // Clear dates when status changes
      shortlistedDate: undefined,
      technicalAssessmentDate: undefined,
      interviewDate: undefined
    };

    // Set appropriate dates based on status
    switch(body.status) {
      case 'Shortlisted':
        updatePayload.shortlistedDate = new Date();
        break;
      case 'Technical Assessment':
        updatePayload.technicalAssessmentDate = new Date();
        break;
      case 'Interviewing':
        updatePayload.interviewDate = new Date();
        break;
      case 'Hired':
        updatePayload.hiredDate = new Date();
        break;
    }

    const updatedApplication = await Application.findByIdAndUpdate(
      params.id,
      updatePayload,
      { new: true, runValidators: true }
    ).select('-__v').lean() as FlattenMaps<ApplicationDocument>;

    if (!updatedApplication) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    return NextResponse.json({
      ...updatedApplication,
      id: updatedApplication._id.toString(),
      _id: undefined
    });
    
  } catch (error) {
    console.error('Error updating application:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  await connectToDatabase();
  
  try {
    const deletedApplication = await Application.findByIdAndDelete(params.id);

    if (!deletedApplication) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    return new NextResponse(null, { status: 204 });
    
  } catch (error) {
    console.error('Error deleting application:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 }
    );
  }
}
