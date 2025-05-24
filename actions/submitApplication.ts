"use server";

import { z } from "zod";
import type { ActionResponse } from "@/types/action";

import { sendEmail } from "@/lib/email";
import { Dropbox } from "dropbox";
import fetch from "node-fetch";
import { refreshDropboxToken } from "@/utils/dropboxAuth/route"; // Ensure this utility function is correctly imported
import {
  getApplicationConfirmationEmail,
  getBaseEmailTemplate,
} from "@/lib/email-templates";
import mongoose from "mongoose";




const submitApplicationSchema = z.object({
  jobId: z.string().min(1, "Job ID is required"),
  cvUrl: z.string().url("Invalid CV URL"),
  answers: z.array(z.object({
    questionId: z.string(),
    questionText: z.string(),
    answer: z.string()
  }))
});

// Rename the local type
type SubmissionResponse = {
  applicationId: string | null;
  error: string | null;
};

export async function submitApplication(data: z.infer<typeof submitApplicationSchema>): Promise<SubmissionResponse> {
  try {
    const parsedData = submitApplicationSchema.parse(data);
    const db = mongoose.connection.db;

    // Extract applicant email from answers
    const applicantEmail = parsedData.answers.find(
      a => a.questionText.toLowerCase() === 'email'
    )?.answer;

    const job = await db.collection('jobpostings').findOne({ 
      _id: new mongoose.Types.ObjectId(parsedData.jobId) 
    });

    const application = {
      jobId: new mongoose.Types.ObjectId(parsedData.jobId),
      cvUrl: parsedData.cvUrl,
      answers: parsedData.answers.map(answer => ({
        questionId: new mongoose.Types.ObjectId(answer.questionId),
        questionText: answer.questionText,
        answer: answer.answer
      })),
      appliedDate: new Date(),
      status: 'Applied',
      position: job?.title || parsedData.jobId,
    };

    const result = await db.collection('applications').insertOne(application);
    
    // Send emails only after successful DB insertion
    try {
      // Send confirmation to applicant
      if (applicantEmail) {
        await sendEmail({
          to: applicantEmail,
          subject: 'Application Received',
          body: getApplicationConfirmationEmail({
            applicantName: parsedData.answers.find(a => 
              a.questionText.toLowerCase().includes('name')
            )?.answer || 'Applicant',
            jobTitle: job?.title || 'the position'
          })
        });
      }

      // Send notification to admin
      await sendEmail({
        to: process.env.HR_EMAIL!,
        subject: 'New Application Received',
        body: getBaseEmailTemplate({
          recipientName: "BQI Hiring Team",
          content: `
            <h1>New Application Submitted</h1>
            <p>Job ID: ${parsedData.jobId}</p>
            <p>Applicant Email: ${applicantEmail || 'Not provided'}</p>
            <p>Submitted at: ${new Date().toLocaleString()}</p>
          `
        })
      });
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
    }

    return {
      applicationId: result.insertedId.toString(),
      error: null,
    };
  } catch (error) {
    console.error("Application submission error:", error);
    return {
      applicationId: null,
      error: error instanceof Error ? error.message : "Failed to submit application",
    };
  }
}
// Function to create a new Dropbox instance
const createDropboxInstance = (accessToken: string) => {
  return new Dropbox({
    accessToken,
    clientId: process.env.DROPBOX_APP_KEY,
    clientSecret: process.env.DROPBOX_APP_SECRET,
    fetch: fetch, // Provide the fetch implementation
  });
};
