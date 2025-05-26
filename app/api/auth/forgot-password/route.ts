import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { User } from '@/models/user';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const { email } = await request.json();

    // Validate input
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return NextResponse.json(
        { error: 'No account found with this email' },
        { status: 404 }
      );
    }

    // Generate reset token
    const resetToken = crypto.randomUUID();
    const resetTokenExpiry = Date.now() + 86400000; // 24 hours

    // Add error logging for token validation
    console.log(`Generated reset token: ${resetToken}`);
    console.log(`Token expires at: ${new Date(resetTokenExpiry).toISOString()}`);

    // Update user with reset token
    await User.findByIdAndUpdate(user._id, {
      resetToken,
      resetTokenExpiry
    });

    // Create SMTP transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '465'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      },
      tls: {
        rejectUnauthorized: process.env.NODE_ENV === 'production' // Only validate cert in production
      }
    });

    // Create HTML content for the email
    const createResetEmailHTML = (resetToken: string) => `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            .container { max-width: 600px; margin: 20px auto; padding: 20px; }
            .button { 
                background-color: #31CDFF; 
                color: white; 
                padding: 12px 24px; 
                border-radius: 8px; 
                text-decoration: none;
                display: inline-block;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Password Reset Request</h1>
            <p>We received a request to reset your password. Click the link below to proceed:</p>
            <a href="${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}" class="button">
                Reset Password
            </a>
            <p style="margin-top: 20px; color: #666;">
                If you didn't request this password reset, you can safely ignore this email.
            </p>
        </div>
    </body>
    </html>
    `;

    // Send email
    await transporter.sendMail({
      from: `BQI Tech <${process.env.FROM_EMAIL}>`,
      to: email,
      subject: 'Password Reset Instructions',
      html: createResetEmailHTML(resetToken)
    });

    return NextResponse.json({
      message: 'Password reset email sent successfully'
    });

  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json(
      { error: 'Failed to process password reset request' },
      { status: 500 }
    );
  }
} 