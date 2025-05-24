import mongoose from 'mongoose';

const JobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  // Add other job fields as needed
});

export const Job = mongoose.models.Job || mongoose.model('Job', JobSchema); 