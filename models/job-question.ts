import mongoose from 'mongoose';

const jobQuestionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  type: { type: String, enum: ['text', 'multiple-choice', 'boolean'], required: true },
  options: [{ type: String }],
  required: { type: Boolean, default: true },
  order: { type: Number, required: true },
  jobIds: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'JobPosting', 
    required: true 
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const JobQuestion = mongoose.models.JobQuestion || 
  mongoose.model('JobQuestion', jobQuestionSchema); 