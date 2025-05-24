import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectToDatabase from '@/lib/mongodb';
import { z } from 'zod';
import { submitApplication } from '@/actions/submitApplication';

const applicationSchema = z.object({
  jobId: z.string().min(1),
  answers: z.array(z.object({
    questionId: z.string(),
    questionText: z.string(),
    answer: z.string()
  })),
  cvUrl: z.string().url().min(1, "CV URL is required")
});

export async function POST(request: Request) {
  await connectToDatabase();

  try {
    const formData = await request.formData();
    
    // Extract all dynamic fields except system fields
    const systemFields = ['jobId', 'cvUrl'];
    const answers = Array.from(formData.entries())
      .filter(([key]) => key.startsWith('question_'))
      .map(([key, value]) => {
        const questionData = JSON.parse(value.toString());
        return {
          questionId: questionData.id,
          questionText: questionData.text,
          answer: questionData.answer
        };
      });

    const submissionData = {
      jobId: formData.get('jobId')?.toString() || '',
      cvUrl: formData.get('cvUrl')?.toString() || '',
      answers
    };

    // Add server-side validation
    const validatedData = applicationSchema.parse({
      jobId: formData.get('jobId'),
      cvUrl: formData.get('cvUrl'),
      answers: answers.map(a => ({
        questionId: a.questionId,
        questionText: a.questionText,
        answer: a.answer
      }))
    });

    // Pass validated data to submit action
    const { applicationId, error } = await submitApplication(validatedData);

    if (error) {
      throw new Error(error);
    }

    return NextResponse.json({ 
      success: true,
      applicationId,
      message: 'Application submitted successfully. Check your email for confirmation.'
    });

  } catch (error) {
    console.error('Submission error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
