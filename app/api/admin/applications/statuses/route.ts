// app/api/admin/statuses/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { Application } from '@/models/application';
import mongoose from 'mongoose';

const predefinedStatuses = [
  'New',
  'Interviewing',
  'Application',
  'Disqualified',
  'Hired'
];

export async function GET() {
  await connectToDatabase();
  
  try {
    // Get distinct status values from MongoDB
    const statuses = await Application.distinct('status');
    
    // Combine with predefined statuses and remove duplicates
    const allStatuses = Array.from(
      new Set([
        ...statuses,
        'New',
        'Interviewing',
        'Application', 
        'Disqualified',
        'Hired'
      ])
    );

    return NextResponse.json(allStatuses);
    
  } catch (error) {
    console.error('Error fetching statuses:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 }
    );
  }
}