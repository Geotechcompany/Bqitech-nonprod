import mongoose from "mongoose";

export interface IUser extends mongoose.Document {
  name?: string;
  email: string;
  password: string;
  role: string;
  emailVerified: boolean;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new mongoose.Schema<IUser>({
  name: String,
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'user' },
  emailVerified: { type: Boolean, default: false },
  image: String,
}, {
  timestamps: true
});

export const User = mongoose.models.User || mongoose.model<IUser>("User", UserSchema); 