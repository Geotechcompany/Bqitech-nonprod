import mongoose from 'mongoose';
import { JobQuestion, JobPosting } from '@/prisma/mongodb-schema';
import connectToDatabase from '@/lib/mongodb';

async function fixNullJobIds() {
  try {
    await connectToDatabase();
    console.log('Connected to database');

    // Find all questions with null jobId and not marked as availableForAllJobs
    const questionsToFix = await JobQuestion.find({
      jobId: null,
      availableForAllJobs: { $ne: true }
    });

    console.log(`Found ${questionsToFix.length} questions to fix`);

    // Get all active jobs
    const jobs = await JobPosting.find({ isActive: true });
    
    if (jobs.length === 0) {
      console.log('No active jobs found');
      return;
    }

    // Update each question
    for (const question of questionsToFix) {
      // If the question should be available for all jobs
      await JobQuestion.findByIdAndUpdate(question._id, {
        $set: {
          availableForAllJobs: true,
          updatedAt: new Date()
        }
      });
      console.log(`Updated question: ${question._id}`);
    }

    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
  }
}

// Run the migration
fixNullJobIds(); 