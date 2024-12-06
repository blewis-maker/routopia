import { createTransport } from 'nodemailer';
import { generateToken } from '@/utils/auth';

const transporter = createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: parseInt(process.env.EMAIL_SERVER_PORT || '587'),
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD
  },
  secure: process.env.EMAIL_SERVER_SECURE === 'true'
});

const FROM_EMAIL = process.env.EMAIL_FROM || 'noreply@routopia.com';
const BASE_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailOptions): Promise<void> {
  try {
    await transporter.sendMail({
      from: FROM_EMAIL,
      to,
      subject,
      html
    });
  } catch (error) {
    console.error('Failed to send email:', error);
    throw new Error('Failed to send email');
  }
}

export async function sendVerificationEmail(email: string): Promise<void> {
  const token = await generateToken();
  const verificationUrl = `${BASE_URL}/auth/verify?token=${token}`;

  const html = `
    <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
      <h1 style="color: #333; text-align: center;">Verify Your Email</h1>
      <p style="color: #666; line-height: 1.6;">
        Thank you for signing up with Routopia! Please click the button below to verify your email address:
      </p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${verificationUrl}" 
           style="background-color: #4444FF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
          Verify Email
        </a>
      </div>
      <p style="color: #666; line-height: 1.6;">
        If you didn't create an account with Routopia, you can safely ignore this email.
      </p>
      <p style="color: #666; line-height: 1.6;">
        Or copy and paste this link in your browser:<br>
        <a href="${verificationUrl}" style="color: #4444FF; word-break: break-all;">
          ${verificationUrl}
        </a>
      </p>
    </div>
  `;

  await sendEmail({
    to: email,
    subject: 'Verify Your Email - Routopia',
    html
  });

  // Store token in database for verification
  await storeVerificationToken(email, token);
}

export async function sendPasswordResetEmail(email: string): Promise<void> {
  const token = await generateToken();
  const resetUrl = `${BASE_URL}/auth/reset-password?token=${token}`;

  const html = `
    <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
      <h1 style="color: #333; text-align: center;">Reset Your Password</h1>
      <p style="color: #666; line-height: 1.6;">
        You requested to reset your password. Click the button below to proceed:
      </p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" 
           style="background-color: #4444FF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
          Reset Password
        </a>
      </div>
      <p style="color: #666; line-height: 1.6;">
        If you didn't request a password reset, you can safely ignore this email.
      </p>
      <p style="color: #666; line-height: 1.6;">
        Or copy and paste this link in your browser:<br>
        <a href="${resetUrl}" style="color: #4444FF; word-break: break-all;">
          ${resetUrl}
        </a>
      </p>
      <p style="color: #666; line-height: 1.6;">
        This link will expire in 1 hour.
      </p>
    </div>
  `;

  await sendEmail({
    to: email,
    subject: 'Reset Your Password - Routopia',
    html
  });

  // Store token in database for verification
  await storePasswordResetToken(email, token);
}

async function storeVerificationToken(email: string, token: string): Promise<void> {
  // Store the token in your database with expiration
  await fetch('/api/auth/store-verification-token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, token })
  });
}

async function storePasswordResetToken(email: string, token: string): Promise<void> {
  // Store the token in your database with expiration
  await fetch('/api/auth/store-reset-token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, token })
  });
}

export async function verifyEmailToken(token: string): Promise<boolean> {
  try {
    const response = await fetch('/api/auth/verify-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    });
    const result = await response.json();
    return result.success;
  } catch (error) {
    console.error('Token verification error:', error);
    return false;
  }
}

export async function verifyPasswordResetToken(token: string): Promise<boolean> {
  try {
    const response = await fetch('/api/auth/verify-reset-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    });
    const result = await response.json();
    return result.success;
  } catch (error) {
    console.error('Reset token verification error:', error);
    return false;
  }
} 