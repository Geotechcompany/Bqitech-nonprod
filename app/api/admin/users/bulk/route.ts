import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const { userIds, role } = await req.json();

  if (!session?.user || session.user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const { db } = await connectToDatabase();
    const result = await db.collection("users").updateMany(
      { _id: { $in: userIds.map((id: string) => new ObjectId(id)) } },
      { $set: { role } }
    );

    return NextResponse.json({
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error("Bulk update failed:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const { db } = await connectToDatabase();
    const { userIds } = await req.json();

    const result = await db.collection("users").deleteMany({
      _id: { $in: userIds.map((id: string) => new ObjectId(id)) }
    });

    return NextResponse.json({
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error("Failed to bulk delete users:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 