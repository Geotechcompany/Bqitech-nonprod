import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { getBaseEmailTemplate } from '@/lib/email-templates'

export async function POST(req: NextRequest) {
  const { name, role, phone, organization, service, email, message } = await req.json()

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST as string,
      port: parseInt(process.env.SMTP_PORT as string, 10),
      secure: false,
      auth: {
        user: process.env.SMTP_USER as string,
        pass: process.env.SMTP_PASS as string
      }
    })

    const emailContent = getBaseEmailTemplate({
      recipientName: 'HR Team',
      content: `
        <p>You have received a new message from the contact form on your website.</p>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Role:</strong> ${role}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Organization:</strong> ${organization}</p>
        <p><strong>Service:</strong> ${service}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong> ${message}</p>
      `
    })

    await transporter.sendMail({
      from: process.env.FROM_EMAIL,
      to: process.env.HR_EMAIL,
      subject: 'New Contact Us Form Submission',
      html: emailContent
    })

    return NextResponse.json({ message: 'Email sent successfully' }, { status: 200 })
  } catch (error) {
    console.error('Error sending email:', error)
    return NextResponse.json({ message: 'Error sending email' }, { status: 500 })
  }
}