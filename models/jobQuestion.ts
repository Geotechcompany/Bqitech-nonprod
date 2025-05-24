import mongoose from 'mongoose';

const jobQuestionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  type: { type: String, required: true },
  required: { type: Boolean, default: false },
  options: [String],
  jobIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'JobPosting' }],
  order: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const JobQuestion = mongoose.models.JobQuestion || 
  mongoose.model('JobQuestion', jobQuestionSchema); 