import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import mongoose from "mongoose";
import connectToDatabase from "@/lib/mongodb";
import { Application } from "@/models/application";

export async function GET(request: NextRequest) {
  await connectToDatabase();
  
  try {
    // Get authenticated user from custom auth
    const authResult = await requireAuth(request);
    
    if (authResult instanceof Response) {
      return authResult;
    }

    // Use verified email from authenticated user
    const userEmail = authResult.email;

    const applications = await Application.aggregate([
      {
        $match: {
          "answers": {
            $elemMatch: {
              "questionText": { $regex: /^email$/i },
              "answer": userEmail
            }
          }
        }
      },
      {
        $project: {
          _id: { $toString: "$_id" },
          name: 1,
          email: 1,
          phoneNumber: 1,
          position: 1,
          status: 1,
          appliedDate: 1,
          cvUrl: 1,
          jobId: 1,
          answers: {
            $map: {
              input: "$answers",
              as: "answer",
              in: {
                questionId: { $toString: "$$answer.questionId" },
                questionText: "$$answer.questionText",
                answer: "$$answer.answer"
              }
            }
          }
        }
      }
    ]);

    return NextResponse.json({ applications });
  } catch (error) {
    console.error("Error fetching applications:", error);
    return NextResponse.json(
      { error: "Internal Server Error" }, 
      { status: 500 }
    );
  }
} 