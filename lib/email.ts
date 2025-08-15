import { Resend } from 'resend';
import { render } from '@react-email/render';
import { VerifyEmailTemplate } from '../emails/templates/verify-email';
import { WelcomeEmailTemplate } from '../emails/templates/welcome-email';

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendVerificationEmailProps {
  to: string;
  token: string;
  locale?: string;
}

interface SendWelcomeEmailProps {
  to: string;
  locale?: string;
}

export async function sendVerificationEmail({
  to,
  token,
  locale = 'en'
}: SendVerificationEmailProps) {
  const verifyUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/auth/verify?token=${token}`;
  
  const html = await render(VerifyEmailTemplate({
    userEmail: to,
    verifyUrl,
    locale
  }));

  const subject = locale === 'es' ? 'Verifica tu correo - IALchemist' :
                  locale === 'fr' ? 'Vérifiez votre e-mail - IALchemist' :
                  'Verify Your Email - IALchemist';

  try {
    await resend.emails.send({
      from: process.env.FROM_EMAIL || 'noreply@ialchemist.app',
      to,
      subject,
      html,
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to send verification email:', error);
    return { success: false, error };
  }
}

export async function sendWelcomeEmail({
  to,
  locale = 'en'
}: SendWelcomeEmailProps) {
  const html = await render(WelcomeEmailTemplate({
    userEmail: to,
    locale
  }));

  const subject = locale === 'es' ? 'Bienvenido a IALchemist' :
                  locale === 'fr' ? 'Bienvenue sur IALchemist' :
                  'Welcome to IALchemist';

  try {
    await resend.emails.send({
      from: process.env.FROM_EMAIL || 'noreply@ialchemist.app',
      to,
      subject,
      html,
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    return { success: false, error };
  }
}

export async function resendVerificationEmail({
  to,
  token,
  locale = 'en'
}: SendVerificationEmailProps) {
  // Same as sendVerificationEmail but with different subject line
  const verifyUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/auth/verify?token=${token}`;
  
  const html = await render(VerifyEmailTemplate({
    userEmail: to,
    verifyUrl,
    locale
  }));

  const subject = locale === 'es' ? 'Reenvío: Verifica tu correo - IALchemist' :
                  locale === 'fr' ? 'Renvoi: Vérifiez votre e-mail - IALchemist' :
                  'Resent: Verify Your Email - IALchemist';

  try {
    await resend.emails.send({
      from: process.env.FROM_EMAIL || 'noreply@ialchemist.app',
      to,
      subject,
      html,
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to resend verification email:', error);
    return { success: false, error };
  }
}