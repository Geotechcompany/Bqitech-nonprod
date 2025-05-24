import { NextRequest, NextResponse } from "next/server"
import { auth, currentUser } from "@clerk/nextjs/server"
import mongoose from "mongoose"
import connectToDatabase from "@/lib/mongodb"
import { Application } from "@/models/application"
import { headers } from "next/headers"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  await connectToDatabase()

  try {
    const { userId } = await auth()
    const user = await currentUser()
    
    if (!userId || !user?.emailAddresses?.[0]?.emailAddress) {
      return NextResponse.json(
        { error: "Unauthorized" }, 
        { status: 401 }
      )
    }

    const userEmail = user.emailAddresses[0].emailAddress

    const application = await Application.findOne({
      _id: new mongoose.Types.ObjectId(params.id),
      email: userEmail
    }).lean() as mongoose.FlattenMaps<mongoose.Document & { _id: mongoose.Types.ObjectId }>;

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
      { error: "Internal Server Error" }, 
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