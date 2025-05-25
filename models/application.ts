import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema({
  name: String,
  email: { type: String, required: true },
  position: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['PENDING', 'REVIEWED', 'ACCEPTED', 'REJECTED'], 
    default: 'PENDING' 
  },
  appliedDate: { type: Date, default: Date.now },
  shortlistedDate: Date,
  answers: [{
    questionText: String,
    answer: String
  }],
  cvUrl: String,
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  applicantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
}, { timestamps: true, strictPopulate: false });

export const Application = mongoose.models.Application || 
  mongoose.model('Application', applicationSchema);

export interface ApplicationDocument extends mongoose.Document {
  name?: string;
  email: string;
  position: string;
  status: string;
  appliedDate: Date;
  shortlistedDate?: Date;
  answers: mongoose.Types.Array<{
    questionText: string;
    answer: string;
  }>;
  cvUrl?: string;
  jobId: mongoose.Types.ObjectId;
  applicantId: mongoose.Types.ObjectId;
} 