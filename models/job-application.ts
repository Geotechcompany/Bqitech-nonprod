import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema({
  jobId: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JobPosting',
    required: true
  },
  cvUrl: { type: String, required: true },
  answers: [{
    questionId: { type: mongoose.Schema.Types.ObjectId, required: true },
    questionText: { type: String, required: true },
    answer: { type: String, required: true }
  }],
  appliedDate: { type: Date, default: Date.now },
  status: { 
    type: String,
    enum: ['New', 'Reviewed', 'Interviewing', 'Hired', 'Rejected'],
    default: 'New'
  },
  position: { type: String, required: true }
});

export const JobApplication = mongoose.model('JobApplication', applicationSchema); 