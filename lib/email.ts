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
  try {
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify-email?token=${token}`;
    
    await sendEmail({
      to: email,
      subject: 'Verify Your Email Address',
      body: `
        <h1>Email Verification</h1>
        <p>Click the link below to verify your email address:</p>
        <a href="${verificationUrl}">Verify Email</a>
        <p>This link will expire in 1 hour.</p>
      `
    });
  } catch (error) {
    console.error('Failed to send verification email:', error);
    throw new Error('Failed to send verification email');
  }
};
