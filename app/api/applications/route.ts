import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import mongoose from "mongoose";
import connectToDatabase from "@/lib/mongodb";
import { Application } from "@/models/application";

export async function GET(request: NextRequest) {
  await connectToDatabase();
  
  try {
    // Get authenticated user from Clerk
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get verified email from Clerk user
    const userEmail = user.emailAddresses.find(
      email => email.id === user.primaryEmailAddressId
    )?.emailAddress;

    if (!userEmail) {
      return NextResponse.json({ error: "Email not found" }, { status: 400 });
    }

    const applications = await Application.aggregate([
      {
        $match: {
          "answers": {
            $elemMatch: {
              "questionText": "Email",
              "answer": userEmail // Use Clerk-verified email
            }
          }
        }
      },
      {
        $project: {
          name: 1,
          email: 1,
          phoneNumber: 1,
          position: 1,
          status: 1,
          appliedDate: 1,
          cvUrl: 1,
          jobId: 1,
          answers: {
            $filter: {
              input: "$answers",
              as: "answer",
              cond: { $ne: ["$$answer.questionText", "Email"] }
            }
          }
        }
      }
    ]);

    return NextResponse.json({
      applications: applications.map(app => ({
        ...app,
        id: app._id.toString(),
        _id: undefined,
      }))
    });
  } catch (error) {
    console.error("Error fetching applications:", error);
    return NextResponse.json(
      { error: "Internal Server Error" }, 
      { status: 500 }
    );
  }
} 