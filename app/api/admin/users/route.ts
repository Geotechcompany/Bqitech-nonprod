import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const { db } = await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const [data, total] = await Promise.all([
      db.collection("users")
        .find()
        .skip((page - 1) * limit)
        .limit(limit)
        .toArray(),
      db.collection("users").countDocuments()
    ]);

    return NextResponse.json({
      data: data.map(user => ({
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role
      })),
      total
    });
  } catch (error) {
    console.error("Failed to fetch users:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("id");
  const { role } = await req.json();

  if (!session || session.user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  if (!userId) {
    return new NextResponse("User ID required", { status: 400 });
  }

  try {
    const { db } = await connectToDatabase();
    const result = await db.collection("users").findOneAndUpdate(
      { _id: new ObjectId(userId) },
      { $set: { role } },
      {
        returnDocument: "after",
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

    if (!result.value) {
      return new NextResponse("User not found", { status: 404 });
    }

    return NextResponse.json(result.value);
  } catch (error) {
    console.error("Failed to update user role:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const { name, email, role } = await req.json();

  if (!session || session.user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  if (!name || !email || !role) {
    return new NextResponse("Missing required fields", { status: 400 });
  }

  try {
    const { db } = await connectToDatabase();
    const newUser = {
      name,
      email,
      role,
      active: true,
      createdAt: new Date().toISOString()
    };

    const result = await db.collection("users").insertOne(newUser);

    return NextResponse.json({
      id: result.insertedId.toString(),
      name,
      email,
      role
    });
  } catch (error) {
    console.error("Failed to create user:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 