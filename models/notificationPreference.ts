import mongoose from 'mongoose';

const notificationPreferenceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  emailEnabled: { type: Boolean, default: true },
  pushEnabled: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const NotificationPreference = mongoose.models.NotificationPreference || 
  mongoose.model('NotificationPreference', notificationPreferenceSchema); 