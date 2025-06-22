import { NextResponse, NextRequest } from 'next/server';
import { requireAuth } from "@/lib/auth";
import mongoose from "mongoose";
import connectToDatabase from "@/lib/mongodb";
import { Application } from "@/models/application";
import { getUserFromRequest } from '@/lib/auth';
import { ObjectId } from 'mongodb';

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { db } = await connectToDatabase();
    const applications = await db.collection('applications')
      .find({ userId: new ObjectId(user.id) })
      .sort({ appliedDate: -1 })
      .toArray();

    return NextResponse.json({ 
      applications: applications.map(app => ({
        ...app,
        id: app._id.toString(),
        _id: undefined
      }))
    });
  } catch (error) {
    console.error('Error fetching applications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    );
  }
} 