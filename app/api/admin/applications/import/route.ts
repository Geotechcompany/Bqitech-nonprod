import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectToDatabase from "@/lib/mongodb";
import { Application } from "@/models/application";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(request: Request) {
  await connectToDatabase();

  try {
    // Verify admin permissions
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Check if user is admin
    const user = await mongoose.model('User').findOne({ email: session.user.email });
    if (!user || user.role !== 'ADMIN') {
      return new NextResponse("Admin access required", { status: 403 });
    }

    const data = await request.json();
    
    const imported = await Application.insertMany(data.map((app: any) => ({
      ...app,
      _id: new mongoose.Types.ObjectId(),
      answers: app.answers?.map((a: any) => ({
        ...a,
        _id: new mongoose.Types.ObjectId()
      }))
    })));

    return NextResponse.json({
      importedCount: imported.length,
      message: "Import successful"
    });

  } catch (error) {
    console.error("Import failed:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 