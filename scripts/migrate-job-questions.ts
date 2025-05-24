import mongoose from 'mongoose';
import { JobQuestion } from '@/models/job-question';
import connectToDatabase from '@/lib/mongodb';

async function migrate() {
  try {
    await connectToDatabase();
    
    const questions = await JobQuestion.find({ jobId: { $exists: true } });
    
    for (const question of questions) {
      await JobQuestion.findByIdAndUpdate(
        question._id,
        { 
          $set: { jobIds: [question.jobId] },
          $unset: { jobId: 1 }
        }
      );
    }
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
  }
}

migrate(); 