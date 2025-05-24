import { NextResponse } from 'next/server'
import connectToDatabase from '@/lib/mongodb'
import { Application } from '@/models/application'
import mongoose from 'mongoose'

export async function GET() {
  await connectToDatabase()
  
  try {
    const recentApplications = await Application.find()
      .sort({ appliedDate: -1 })
      .limit(5)
      .select('name email appliedDate status')
      .lean()

    // Transform MongoDB _id to id and format dates
    const transformed = recentApplications.map(app => ({
      id: app._id.toString(),
      name: app.name,
      email: app.email,
      status: app.status,
      appliedDate: app.appliedDate.toISOString(),
      _id: undefined
    }))

    return NextResponse.json(transformed)
  } catch (error) {
    console.error('Error fetching recent applications:', error)
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 }
    )
  }
} 