import { NextRequest, NextResponse } from 'next/server';
import { verifyUserEmail } from '../../../../lib/db';
import { sendWelcomeEmail } from '../../../../lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400 }
      );
    }

    // Verify the user's email
    const result = await verifyUserEmail(token);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    // Send welcome email
    if (result.user) {
      await sendWelcomeEmail({
        to: result.user.email,
        locale: result.user.locale,
      });
    }

    return NextResponse.json({
      message: 'Email verified successfully!',
      user: result.user
    });

  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle GET requests for email verification links
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.redirect(new URL('/auth/error?error=MissingToken', request.url));
  }

  try {
    // Verify the user's email
    const result = await verifyUserEmail(token);

    if (!result.success) {
      return NextResponse.redirect(new URL(`/auth/error?error=VerificationFailed`, request.url));
    }

    // Send welcome email
    if (result.user) {
      await sendWelcomeEmail({
        to: result.user.email,
        locale: result.user.locale,
      });
    }

    // Redirect to success page or sign-in
    const locale = result.user?.locale || 'en';
    return NextResponse.redirect(new URL(`/${locale}/auth/verified`, request.url));

  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.redirect(new URL('/auth/error?error=ServerError', request.url));
  }
}