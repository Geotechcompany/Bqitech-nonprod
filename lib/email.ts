import { createTransport } from 'nodemailer';

interface EmailParams {
  to: string;
  subject: string;
  body: string;
}

export const sendEmail = async (options: {
  to: string;
  subject: string;
  body: string;
}) => {
  if (typeof window !== 'undefined') {
    console.log('Email sending is not available on the client-side');
    return;
  }

  const transporter = createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  try {
    await transporter.sendMail({
      from: `"BQI Tech Careers" <${process.env.FROM_EMAIL}>`,
      to: options.to,
      subject: options.subject,
      html: options.body
    });
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Email sending error:', error);
    throw new Error('Failed to send confirmation email');
  }
};

export const sendVerificationEmail = async (email: string, token: string) => {
  const verificationLink = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/verify-email?token=${token}`
  
  return sendEmail({
    to: email,
    subject: 'Verify Your Email Address',
    body: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">BQI Tech Email Verification</h2>
        <p>Please click the button below to verify your email address:</p>
        <a href="${verificationLink}" 
           style="display: inline-block; padding: 12px 24px; background-color: #2563eb; 
                  color: white; text-decoration: none; border-radius: 4px; margin: 20px 0;">
          Verify Email
        </a>
        <p>This link will expire in 1 hour.</p>
        <p style="color: #6b7280;">If you didn't create an account with BQI Tech, 
           you can safely ignore this email.</p>
      </div>
    `
  })
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;

  await sendEmail({
    to: email,
    subject: 'BQI Tech Password Reset Request',
    body: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Password Reset Request</h2>
        <p>We received a request to reset your BQI Tech account password. Click the button below to proceed:</p>
        <a href="${resetUrl}" 
           style="display: inline-block; padding: 12px 24px; background-color: #2563eb; 
                  color: white; text-decoration: none; border-radius: 4px; margin: 20px 0;">
          Reset Password
        </a>
        <p>This link will expire in 1 hour.</p>
        <p style="color: #6b7280;">If you didn't request this password reset, please ignore this email.</p>
      </div>
    `
  });
}
