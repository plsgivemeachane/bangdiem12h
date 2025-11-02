import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: process.env.EMAIL_SERVER_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
})

export async function sendEmail({
  to,
  subject,
  text,
  html,
}: {
  to: string
  subject: string
  text?: string
  html?: string
}) {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      text,
      html,
    })
    console.log(`Email sent to ${to}`)
  } catch (error) {
    console.error('Failed to send email:', error)
    throw error
  }
}

export async function sendInvitationEmail({
  to,
  groupName,
  invitedBy,
  invitationLink,
}: {
  to: string
  groupName: string
  invitedBy: string
  invitationLink: string
}) {
  const subject = `Invitation to join ${groupName}`
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Group Invitation</h2>
      <p>Hello,</p>
      <p><strong>${invitedBy}</strong> has invited you to join the group <strong>${groupName}</strong>.</p>
      <p>Click the button below to accept the invitation:</p>
      <a href="${invitationLink}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
        Accept Invitation
      </a>
      <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
      <p>${invitationLink}</p>
      <hr>
      <p><small>This invitation will expire in 7 days.</small></p>
    </div>
  `
  
  await sendEmail({
    to,
    subject,
    html,
  })
}