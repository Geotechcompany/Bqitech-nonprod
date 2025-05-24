import mongoose from 'mongoose';

const QuestionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  // Add other question properties as needed
});

export const Question = mongoose.models.Question || 
  mongoose.model('Question', QuestionSchema); 