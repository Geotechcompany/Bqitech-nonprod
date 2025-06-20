import { Schema, model, models } from 'mongoose';

const notificationSchema = new Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['APPLICATION', 'INTERVIEW', 'SYSTEM', 'OTHER'],
    default: 'OTHER'
  },
  read: {
    type: Boolean,
    default: false
  },
  link: {
    type: String
  },
  expiresAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export const Notification = models.Notification || model('Notification', notificationSchema); 