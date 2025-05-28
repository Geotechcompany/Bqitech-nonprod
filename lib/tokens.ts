import crypto from 'crypto'
import { User } from '@/models/user'
import { Token } from '@/models/token'

export async function generateEmailVerificationToken(email: string) {
  const user = await User.findOne({ email });
  if (!user) throw new Error('User not found');

  // Delete any existing verification tokens
  await Token.deleteMany({ userId: user._id, type: 'EMAIL_VERIFICATION' });

  const token = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + 3600000); // 1 hour expiration

  const verificationToken = await Token.create({
    userId: user._id,
    token,
    type: 'EMAIL_VERIFICATION',
    expires
  });

  return verificationToken;
} 