import mongoose from 'mongoose';

const JobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  requirements: [String],
  location: String,
  salaryRange: {
    min: Number,
    max: Number
  },
  // Add other job fields as needed
}, { timestamps: true });

export const Job = mongoose.models.Job || mongoose.model('Job', JobSchema); 