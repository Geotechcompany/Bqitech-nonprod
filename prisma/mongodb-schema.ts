import mongoose, { Schema, model, models, Document, Model } from 'mongoose';

// Interfaces
interface IUser extends Document {
  email: string;
  name: string;
  phoneNumber?: string;
  clerkId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface IApplication extends Document {
  name: string;
  email: string;
  position: string;
  appliedDate: Date;
  status: string;
  shortlistedDate?: Date;
  assessmentDate?: Date;
  assessmentScore?: number;
  interviewDate?: Date;
  interviewer?: string;
  hireDate?: Date;
  startDate?: Date;
  disqualifiedDate?: Date;
  disqualifiedReason?: string;
  experience: string;
  hearAbout: string;
  location: string;
  otherSource?: string;
  phoneNumber?: string;
  resumeUrl?: string;
  salary: string;
  userId?: string;
  lastUpdated: Date;
  cotsExperience?: string;
  reportDevelopmentExperience?: string;
  sqlJavaScriptExperience?: string;
  jobId: {
    type: Schema.Types.ObjectId,
    ref: 'JobPosting',
    required: true
  };
}

interface IJobPosting extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  department?: string;
  location: string;
  description: string;
  postedDate: Date;
  employmentType: string;
  category?: string;
  isActive: boolean;
  salary?: {
    currency: string;
    min?: number;
    max?: number;
  };
  requirements: string[];
  questions: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

interface INotification extends Document {
  title: string;
  message: string;
  type: string;
  date: Date;
  isRead: boolean;
  userId?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface IUserSettings extends Document {
  userId: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  autoLogout: number;
  tableRowsPerPage: number;
  sidebarCollapsed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface INotificationPreference extends Document {
  userId: string;
  emailEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface IBlogPost extends Document {
  title: string;
  excerpt: string;
  content: string;
  imageUrl: string;
  category: string;
  readTime: string;
  slug: string;
  published: boolean;
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface IJobQuestion extends Document {
  question: string;
  type: string;
  options: string[];
  required: boolean;
  order: number;
  jobIds: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

// Schemas
const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  phoneNumber: String,
  clerkId: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const ApplicationSchema = new Schema<IApplication>({
  name: { type: String, required: true },
  email: { type: String, required: true },
  position: { type: String, required: true },
  appliedDate: { type: Date, default: Date.now },
  status: { type: String, required: true },
  shortlistedDate: Date,
  assessmentDate: Date,
  assessmentScore: Number,
  interviewDate: Date,
  interviewer: String,
  hireDate: Date,
  startDate: Date,
  disqualifiedDate: Date,
  disqualifiedReason: String,
  experience: { type: String, required: true },
  hearAbout: { type: String, required: true },
  location: { type: String, required: true },
  otherSource: String,
  phoneNumber: String,
  resumeUrl: String,
  salary: { type: String, required: true },
  userId: { type: String, ref: 'User' },
  lastUpdated: { type: Date, default: Date.now },
  cotsExperience: String,
  reportDevelopmentExperience: String,
  sqlJavaScriptExperience: String,
  jobId: {
    type: Schema.Types.ObjectId,
    ref: 'JobPosting',
    required: true
  }
}, {
  strict: false,
  strictQuery: false,
  toObject: { virtuals: true },
  toJSON: { virtuals: true }
});

// Add virtual population
ApplicationSchema.virtual('jobDetails', {
  ref: 'JobPosting',
  localField: 'jobId',
  foreignField: '_id',
  justOne: true
});

const JobPostingSchema = new Schema<IJobPosting>({
  _id: mongoose.Types.ObjectId,
  title: { type: String, required: true },
  department: { type: String, default: "" },
  location: { type: String, required: true },
  description: { type: String, required: true },
  postedDate: { type: Date, default: Date.now },
  employmentType: { type: String, default: "Full-time" },
  category: { type: String, default: "" },
  isActive: { type: Boolean, default: true },
  salary: {
    currency: { type: String, default: "KES" },
    min: Number,
    max: Number
  },
  requirements: [{ type: String }],
  questions: [{ type: Schema.Types.ObjectId, ref: 'JobQuestion' }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  strict: false,
  timestamps: true
});

const NotificationSchema = new Schema<INotification>({
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, required: true },
  date: { type: Date, default: Date.now },
  isRead: { type: Boolean, default: false },
  userId: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const UserSettingsSchema = new Schema<IUserSettings>({
  userId: { type: String, required: true, unique: true, ref: 'User' },
  emailNotifications: { type: Boolean, default: true },
  pushNotifications: { type: Boolean, default: true },
  autoLogout: { type: Number, default: 30 },
  tableRowsPerPage: { type: Number, default: 10 },
  sidebarCollapsed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const NotificationPreferenceSchema = new Schema<INotificationPreference>({
  userId: { type: String, required: true, unique: true, ref: 'User' },
  emailEnabled: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const BlogPostSchema = new Schema<IBlogPost>({
  title: { type: String, required: true },
  excerpt: { type: String, required: true },
  content: { type: String, required: true },
  imageUrl: { type: String, required: true },
  category: { type: String, required: true },
  readTime: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  published: { type: Boolean, default: false },
  authorId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const JobQuestionSchema = new Schema<IJobQuestion>({
  question: { type: String, required: true },
  type: { type: String, required: true },
  options: { type: [String], default: [] },
  required: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
  jobIds: {
    type: [Schema.Types.ObjectId],
    ref: 'JobPosting',
    default: [],
    required: false
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { 
  strict: false,
  strictQuery: false,
  validateBeforeSave: false 
});

// Add indexes
JobPostingSchema.index({ isActive: 1, postedDate: -1 });
JobPostingSchema.index({ title: 'text', description: 'text' });

// Add timestamps to all schemas
const schemaOptions = { timestamps: true };
[
  UserSchema,
  ApplicationSchema,
  NotificationSchema,
  UserSettingsSchema,
  NotificationPreferenceSchema,
  BlogPostSchema,
  JobQuestionSchema
].forEach(schema => {
  schema.set('timestamps', true);
});

// Models with TypeScript interfaces
const User = models.User || model<IUser>('User', UserSchema);
const Application = models.Application || model<IApplication>('Application', ApplicationSchema);
const JobPosting = models.JobPosting || model<IJobPosting>('JobPosting', JobPostingSchema);
const Notification = models.Notification || model<INotification>('Notification', NotificationSchema);
const UserSettings = models.UserSettings || model<IUserSettings>('UserSettings', UserSettingsSchema);
const NotificationPreference = models.NotificationPreference || model<INotificationPreference>('NotificationPreference', NotificationPreferenceSchema);
const BlogPost = models.BlogPost || model<IBlogPost>('BlogPost', BlogPostSchema);
const JobQuestion = models.JobQuestion || model<IJobQuestion>('JobQuestion', JobQuestionSchema);

// Add migration logic for existing questions
const migrateQuestions = async () => {
  await JobQuestion.updateMany(
    { jobIds: { $exists: false } },
    { $set: { jobIds: [] } }
  );
};

// Run migration when connected
mongoose.connection.on('connected', () => {
  migrateQuestions().catch(console.error);
});

export type {
  IUser,
  IApplication,
  IJobPosting,
  INotification
};

export type { IUserSettings };
export type { INotificationPreference };
export type { IBlogPost };
export type { IJobQuestion };

export {
  User,
  Application,
  JobPosting,
  Notification,
  UserSettings,
  NotificationPreference,
  BlogPost,
  JobQuestion
}; 