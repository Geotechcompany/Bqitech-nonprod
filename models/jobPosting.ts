import mongoose from 'mongoose';
import type { IJobPosting } from '@/prisma/mongodb-schema';

const JobPostingSchema = new mongoose.Schema<IJobPosting>({
  title: { type: String, required: true },
  department: String,
  location: { type: String, required: true },
  description: { type: String, required: true },
  postedDate: { type: Date, default: Date.now },
  employmentType: { type: String, default: 'Full-time' },
  category: String,
  isActive: { type: Boolean, default: true },
  salary: {
    currency: { type: String, default: 'KES' },
    min: Number,
    max: Number
  },
  requirements: [String],
  questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'JobQuestion' }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const JobPosting = mongoose.models.JobPosting as mongoose.Model<IJobPosting> || 
  mongoose.model<IJobPosting>('JobPosting', JobPostingSchema); 