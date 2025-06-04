import mongoose from 'mongoose';

const userSettingsSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  emailNotifications: { type: Boolean, default: true },
  pushNotifications: { type: Boolean, default: true },
  autoLogout: { type: Number, default: 30 },
  tableRowsPerPage: { type: Number, default: 10 },
  sidebarCollapsed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const UserSettings = mongoose.models.UserSettings || 
  mongoose.model('UserSettings', userSettingsSchema); 