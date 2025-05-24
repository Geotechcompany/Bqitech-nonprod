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
