import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectToDatabase from "@/lib/mongodb";
import { Application } from "@/models/application";
import { auth } from "@clerk/nextjs/server";

export async function POST(request: Request) {
  await connectToDatabase();

  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

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