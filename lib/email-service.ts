import nodemailer from 'nodemailer'

interface EmailAttachment {
  filename: string
  content: Buffer
  contentType: string
}

interface SendEmailOptions {
  to: string
  subject: string
  html: string
  attachments?: EmailAttachment[]
  from?: string
}

// Create reusable transporter object using the SMTP transport
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendEmail(options: SendEmailOptions): Promise<boolean> {
  try {

    // Verify connection configuration
    await transporter.verify()

    const mailOptions = {
      from: options.from || `"${process.env.ORGANIZATION_NAME || 'Organization'}" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      attachments: options.attachments?.map(att => ({
        filename: att.filename,
        content: att.content,
        contentType: att.contentType
      }))
    }

    const info = await transporter.sendMail(mailOptions)

    console.log('Email sent successfully:', {
      messageId: info.messageId,
      to: options.to,
      subject: options.subject
    })

    return true
  } catch (error) {
    console.error('Error sending email:', error)
    throw new Error(`Failed to send email: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// Helper function to send 80G certificate email (using the existing generateCertificateEmailBody)
export async function send80GCertificateEmail(
  recipientEmail: string,
  certificateData: any,
  pdfBuffer: Buffer
): Promise<boolean> {
  try {
    // Use the existing generateCertificateEmailBody function from your code
    const emailBody = generateCertificateEmailBody(certificateData)

    const emailOptions: SendEmailOptions = {
      to: recipientEmail,
      subject: `80G Tax Exemption Certificate - ${certificateData?.certificate_number}`,
      html: emailBody,
      attachments: [{
        filename: `80G_Certificate_${certificateData?.certificate_number.replace(/\//g, '_')}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf'
      }]
    }

    return await sendEmail(emailOptions)
  } catch (error) {
    console.error('Error sending 80G certificate email:', error)
    throw error
  }
}

// Helper function for sending OTP emails
export async function sendOTPEmail(
  recipientEmail: string,
  otp: string,
  recipientName?: string
): Promise<boolean> {
  const emailBody = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f8f9fa; padding: 30px; }
        .otp-box { background: white; border: 2px dashed #667eea; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }
        .otp-code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px; }
        .footer { background: #343a40; color: white; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; }
        .warning { color: #e74c3c; font-size: 14px; margin-top: 15px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Email Verification</h1>
          <p>Please verify your email address</p>
        </div>
        
        <div class="content">
          <p>Hello ${recipientName || 'User'},</p>
          <p>Thank you for registering with us. To complete your registration, please use the following One-Time Password (OTP):</p>
          
          <div class="otp-box">
            <div class="otp-code">${otp}</div>
          </div>
          
          <p>This OTP is valid for <strong>10 minutes</strong> only. Please do not share this code with anyone.</p>
          
          <div class="warning">
            <strong>Security Notice:</strong> If you did not request this verification, please ignore this email or contact our support team.
          </div>
        </div>
        
        <div class="footer">
          <p>${process.env.ORGANIZATION_NAME || 'Your Organization'}</p>
          <p style="font-size: 12px; margin-top: 10px;">This is an automated message. Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `

  return await sendEmail({
    to: recipientEmail,
    subject: 'Email Verification - OTP',
    html: emailBody
  })
}

// Helper function to generate the certificate email body (from your existing code)
function generateCertificateEmailBody(certificateData: any): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .header { background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
        .content { padding: 20px; }
        .footer { margin-top: 30px; padding: 15px; background-color: #f8f9fa; border-radius: 5px; }
        .amount { font-weight: bold; color: #28a745; font-size: 18px; }
        .certificate-number { font-weight: bold; color: #007bff; }
      </style>
    </head>
    <body>
      <div class="header">
        <h2>80G Tax Exemption Certificate</h2>
        <p>Dear ${certificateData?.donor.name},</p>
      </div>
     
      <div class="content">
        <p>Thank you for your generous donation(s). We are pleased to provide you with your 80G tax exemption certificate.</p>
       
        <h3>Certificate Details:</h3>
        <ul>
          <li><strong>Certificate Number:</strong> <span class="certificate-number">${certificateData?.certificate_number}</span></li>
          <li><strong>Financial Year:</strong> ${certificateData?.financial_year}</li>
          <li><strong>Total Donation Amount:</strong> <span class="amount">₹${certificateData?.total_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></li>
          <li><strong>Amount in Words:</strong> ${certificateData?.amount_in_words}</li>
          <li><strong>Issue Date:</strong> ${new Date(certificateData?.issue_date).toLocaleDateString('en-IN')}</li>
        </ul>
       
        <p>This certificate is valid for claiming tax deduction under Section 80G of the Income Tax Act, 1961.</p>
       
        <p><strong>Important Notes:</strong></p>
        <ul>
          <li>Please retain this certificate for your tax filing records</li>
          <li>This certificate covers all your donations for the specified financial year</li>
          <li>For any queries regarding this certificate, please contact us</li>
        </ul>
      </div>
     
      <div class="footer">
        <p><strong>${certificateData?.organization?.name}</strong><br>
        ${certificateData?.organization?.address}<br>
        Email: ${certificateData?.organization?.email}<br>
        Phone: ${certificateData?.organization?.phone}<br>
        Website: ${certificateData?.organization?.website}</p>
       
        <p style="margin-top: 15px; font-size: 12px; color: #666;">
          This is an automatically generated email. Please do not reply to this email.
        </p>
      </div>
    </body>
    </html>
  `
}