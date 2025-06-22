import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import mongoose from "mongoose"
import connectToDatabase from "@/lib/mongodb"
import { Application } from "@/models/application"
import { headers } from "next/headers"
import { authOptions } from "@/lib/auth"
import { getUserFromRequest } from '@/lib/auth'
import { ObjectId } from 'mongodb'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" }, 
        { status: 401 }
      )
    }

    const { db } = await connectToDatabase()
    const application = await db.collection('applications').findOne({
      _id: new ObjectId(params.id),
      userId: new ObjectId(user.id)
    })

    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      )
    }

    const headers = new Headers();
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    headers.set('Access-Control-Allow-Headers', 'Content-Type');

    return NextResponse.json({
      ...application,
      id: application._id.toString(),
      _id: undefined
    }, { headers });
  } catch (error) {
    console.error("Error fetching application:", error)
    return NextResponse.json(
      { error: "Failed to fetch application" }, 
      { status: 500 }
    )
  }
}

export async function OPTIONS() {
  const headers = new Headers();
  headers.set('Access-Control-Allow-Origin', '*');
  headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type');
  
  return new NextResponse(null, { headers });
} 