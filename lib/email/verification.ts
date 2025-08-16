import { Resend } from "resend";
import VerificationEmail from "@/emails/templates/verify-email";
import WelcomeEmail from "@/emails/templates/welcome-email";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationEmail(
  email: string,
  name: string,
  token: string
) {
  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify?token=${token}`;

  const { error } = await resend.emails.send({
    from: process.env.EMAIL_FROM!,
    to: email,
    subject: "Verify your IALchemist account",
    react: VerificationEmail({
      userEmail: email,
      verifyUrl: verificationUrl,
    }),
  });

  if (error) {
    throw new Error(`Failed to send verification email: ${error.message}`);
  }
}

export async function sendWelcomeEmail(email: string, name: string) {
  const { error } = await resend.emails.send({
    from: process.env.EMAIL_FROM!,
    to: email,
    subject: "Welcome to IALchemist - Your Journey Begins",
    react: WelcomeEmail({
      userEmail: email,
    }),
  });

  if (error) {
    throw new Error(`Failed to send welcome email: ${error.message}`);
  }
}

export async function sendPasswordResetEmail(
  email: string,
  name: string,
  token: string
) {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${token}`;

  try {
    const { error } = await resend.emails.send({
      from: process.env.EMAIL_FROM!,
      to: email,
      subject: "Reset your IALchemist password",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #1a365d; margin-bottom: 10px;">IALchemist</h1>
            <p style="color: #4a5568; font-size: 16px;">Password Reset Request</p>
          </div>
          
          <div style="background: #f7fafc; padding: 25px; border-radius: 8px; margin-bottom: 20px;">
            <p style="color: #2d3748; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">
              Hello ${name},
            </p>
            <p style="color: #2d3748; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">
              We received a request to reset your password for your IALchemist account. Click the button below to create a new password:
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background: linear-gradient(to right, #d69e2e, #b7791f); color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                Reset Your Password
              </a>
            </div>
            <p style="color: #718096; font-size: 14px; line-height: 1.4;">
              If you didn't request this password reset, please ignore this email. The link will expire in 1 hour for security.
            </p>
          </div>
          
          <div style="text-align: center; color: #a0aec0; font-size: 12px;">
            <p>This email was sent by IALchemist</p>
            <p>If you have trouble clicking the button, copy and paste this URL into your browser:</p>
            <p style="word-break: break-all;">${resetUrl}</p>
          </div>
        </div>
      `,
    });

    if (error) {
      throw new Error(`Failed to send password reset email: ${error.message}`);
    }
  } catch (error) {
    throw new Error(`Failed to send password reset email: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}