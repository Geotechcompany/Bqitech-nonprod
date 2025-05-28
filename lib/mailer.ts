import { createTransport } from 'nodemailer'

export async function sendVerificationEmail(email: string, code: string) {
  const transport = createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    },
    tls: {
      rejectUnauthorized: process.env.NODE_ENV === 'production' // Only validate cert in production
    }
  })

  try {
    await transport.sendMail({
      from: `"BQI Technologies" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Verify Your Email Address',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1a237e;">Email Verification Code</h2>
          <p style="font-size: 16px;">Your verification code is:</p>
          <div style="background: #f5f5f5; padding: 20px; border-radius: 5px; text-align: center; margin: 20px 0;">
            <strong style="font-size: 24px; letter-spacing: 2px;">${code}</strong>
          </div>
          <p style="font-size: 14px; color: #616161;">
            This code will expire in 10 minutes.<br>
            If you didn't request this code, please ignore this email.
          </p>
        </div>
      `
    })
  } catch (error) {
    console.error('Email sending failed:', error)
    throw new Error('Failed to send verification email')
  }
} 