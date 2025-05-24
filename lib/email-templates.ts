interface EmailTemplateProps {
  recipientName: string
  content: string
  ctaLink?: string
  ctaText?: string
}

export function getBaseEmailTemplate({
  recipientName,
  content,
  ctaLink,
  ctaText
}: EmailTemplateProps): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>BQI Tech</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
      </style>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Inter', sans-serif; line-height: 1.6; background-color: #f4f4f5;">
      <table role="presentation" style="width: 100%; border: none; border-spacing: 0; background-color: #f4f4f5; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table role="presentation" style="width: 100%; max-width: 600px; border: none; border-spacing: 0; background-color: white; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <!-- Header -->
              <tr>
                <td style="padding: 40px 40px 20px 40px; text-align: center;">
                  <img src="${process.env.NEXT_PUBLIC_APP_URL}/bqilogo.png" alt="BQI Tech Logo" style="width: 150px; height: auto;">
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 20px 40px;">
                  <h1 style="color: #18181b; font-size: 24px; font-weight: 600; margin-bottom: 20px;">
                    Hello ${recipientName},
                  </h1>
                  <div style="color: #3f3f46; font-size: 16px;">
                    ${content}
                  </div>
                </td>
              </tr>
              
              ${ctaLink && ctaText ? `
              <!-- CTA Button -->
              <tr>
                <td style="padding: 20px 40px;">
                  <table role="presentation" style="width: 100%; border: none; border-spacing: 0;">
                    <tr>
                      <td align="center">
                        <a href="${ctaLink}" 
                           style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px; font-weight: 500; transition: background-color 0.3s ease;">
                          ${ctaText}
                        </a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              ` : ''}
              
              <!-- Footer -->
              <tr>
                <td style="padding: 20px 40px 40px 40px; border-top: 1px solid #e4e4e7; margin-top: 20px;">
                  <table role="presentation" style="width: 100%; border: none; border-spacing: 0;">
                    <tr>
                      <td style="color: #71717a; font-size: 14px; text-align: center;">
                        <p style="margin: 0 0 8px 0;">© ${new Date().getFullYear()} BQI Tech. All rights reserved.</p>
                        <p style="margin: 0;">
                          <a href="${process.env.NEXT_PUBLIC_APP_URL}/privacy" style="color: #2563eb; text-decoration: none;">Privacy Policy</a>
                          &nbsp;•&nbsp;
                          <a href="${process.env.NEXT_PUBLIC_APP_URL}/terms" style="color: #2563eb; text-decoration: none;">Terms of Service</a>
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `
}

export function getApplicationConfirmationEmail(props: {
  applicantName: string;
  jobTitle: string;
}) {
  return getBaseEmailTemplate({
    recipientName: props.applicantName,
    content: `
      <h1>Application Received</h1>
     
      <p>Your application for the <strong>${props.jobTitle}</strong> position has been received.</p>
      <p>We will review your application and contact you within 3-5 business days.</p>
    `,
    ctaLink: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/applications`,
    ctaText: 'View Application Status'
  });
}

export function getInterviewInvitationEmail(name: string, position: string, date: string, location: string): string {
  return getBaseEmailTemplate({
    recipientName: name,
    content: `
      <p>We are pleased to invite you for an interview for the ${position} position.</p>
      <p><strong>Interview Details:</strong></p>
      <ul style="padding-left: 20px; margin: 16px 0;">
        <li>Date: ${date}</li>
        <li>Location: ${location}</li>
      </ul>
      <p>Please confirm your attendance by clicking the button below.</p>
    `,
    ctaLink: `${process.env.NEXT_PUBLIC_APP_URL}/careers/interview-confirmation`,
    ctaText: 'Confirm Interview'
  });
}

export function getStatusChangeEmail(name: string, position: string, newStatus: string): string {
  let statusSpecificContent = '';
  
  switch (newStatus) {
    case 'Shortlisted':
      statusSpecificContent = `
        <p>Congratulations! Your application for the ${position} position has been shortlisted.</p>
        <p>Our team was impressed with your profile and would like to proceed to the next stage of the selection process.</p>
        <p>We will contact you soon with more details about the next steps.</p>
      `;
      break;
    case 'Technical Assessment':
      statusSpecificContent = `
        <p>Your application for the ${position} position has progressed to the Technical Assessment stage.</p>
        <p>You will receive a separate email with instructions for completing the technical assessment.</p>
        <p>Please complete the assessment within the specified timeframe.</p>
      `;
      break;
    case 'Interviewing':
      statusSpecificContent = `
        <p>Congratulations! You have been selected for an interview for the ${position} position.</p>
        <p>We will contact you shortly to schedule the interview at a time that works best for you.</p>
        <p>Please ensure your contact information is up to date.</p>
      `;
      break;
    case 'Hired':
      statusSpecificContent = `
        <p>Congratulations! We are pleased to inform you that you have been selected for the ${position} position.</p>
        <p>You will receive a formal offer letter shortly with more details about the next steps.</p>
        <p>Welcome to the team!</p>
      `;
      break;
    case 'Disqualified':
      statusSpecificContent = `
        <p>Thank you for your interest in the ${position} position at BQI Tech.</p>
        <p>After careful consideration, we regret to inform you that we will not be moving forward with your application at this time.</p>
        <p>We encourage you to apply for future positions that match your skills and experience.</p>
      `;
      break;
    default:
      statusSpecificContent = `
        <p>Your application status for the ${position} position has been updated to ${newStatus}.</p>
        <p>You can track your application status through our career portal.</p>
      `;
  }

  return getBaseEmailTemplate({
    recipientName: name,
    content: statusSpecificContent,
    ctaLink: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/applications`,
    ctaText: 'View Application Status'
  });
}
