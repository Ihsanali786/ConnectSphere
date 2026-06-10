import nodemailer from 'nodemailer';

let transporter;

const getTransporter = () => {
  if (transporter) return transporter;

  if (process.env.SMTP_HOST) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT, 10) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    transporter = nodemailer.createTransport({ jsonTransport: true });
  }

  return transporter;
};

export const sendEmail = async ({ to, subject, html }) => {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

  if (!process.env.SMTP_HOST) {
    console.log('\n--- DEV EMAIL ---');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim());
    console.log('-----------------\n');
    return;
  }

  await getTransporter().sendMail({
    from: process.env.SMTP_FROM || `ConnectSphere <noreply@${new URL(clientUrl).hostname}>`,
    to,
    subject,
    html,
  });
};

export const sendVerificationEmail = async (user, rawToken) => {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const link = `${clientUrl}/verify-email?token=${rawToken}`;

  await sendEmail({
    to: user.email,
    subject: 'Verify your ConnectSphere account',
    html: `
      <h2>Welcome to ConnectSphere, ${user.username}!</h2>
      <p>Please verify your email by clicking the link below:</p>
      <p><a href="${link}">Verify Email</a></p>
      <p>This link expires in 24 hours.</p>
    `,
  });
};

export const sendPasswordResetEmail = async (user, rawToken) => {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const link = `${clientUrl}/reset-password?token=${rawToken}`;

  await sendEmail({
    to: user.email,
    subject: 'Reset your ConnectSphere password',
    html: `
      <h2>Password reset requested</h2>
      <p>Hi ${user.username}, click below to reset your password:</p>
      <p><a href="${link}">Reset Password</a></p>
      <p>This link expires in 1 hour. If you didn't request this, ignore this email.</p>
    `,
  });
};
