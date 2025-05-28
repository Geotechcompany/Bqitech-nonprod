import { sendEmail } from '@/lib/email'

export async function sendVerificationEmail(email: string, token: string) {
  const verificationLink = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/verify-email?token=${token}`
  
  await sendEmail({
    to: email,
    subject: 'Verify your email address',
    body: `
      <p>Please click the link below to verify your email address:</p>
      <a href="${verificationLink}">Verify Email</a>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `
  })
} 