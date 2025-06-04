import { authOptions } from "@/lib/auth";

import { NextRequest } from "next/server";

import { getServerSession } from "next-auth";

import { connectToDatabase } from "@/lib/mongodb";

import { NextResponse } from "next/server";

import { ObjectId } from 'mongodb';

export async function GET(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const { db } = await connectToDatabase();
    const user = await db.collection("users").findOne(
      { _id: new ObjectId(params.userId) },
      {
        projection: {
          _id: 0,
          id: "$_id",
          name: 1,
          email: 1,
          role: 1,
          createdAt: { $toString: "$createdAt" }
        }
      }
    );

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Failed to fetch user:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const { db } = await connectToDatabase();
    const result = await db.collection("users").deleteOne({
      _id: new ObjectId(params.userId)
    });

    if (result.deletedCount === 0) {
      return new NextResponse("User not found", { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete user:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  const updateData = await req.json();
  
  try {
    const { db } = await connectToDatabase();
    const result = await db.collection("users").findOneAndUpdate(
      { _id: new ObjectId(params.userId) },
      { $set: updateData },
      {
        returnDocument: "after",
        projection: {
          _id: 0,
          id: "$_id",
          name: 1,
          email: 1,
          role: 1,
          active: 1,
          createdAt: { $toString: "$createdAt" }
        }
      }
    );

    if (!result.value) {
      return new NextResponse("User not found", { status: 404 });
    }

    return NextResponse.json(result.value);
  } catch (error) {
    console.error("Failed to update user:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 