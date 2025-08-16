import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { verifyToken } from "@/lib/auth/tokens";
import { sendWelcomeEmail } from "@/lib/email/verification";
import logger from "@/lib/logger";

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    // Verify token
    const decoded = await verifyToken(token, "email_verification");

    // Update user's email verification status
    const user = await prisma.user.update({
      where: { id: decoded.userId },
      data: {
        emailVerified: new Date(),
      },
    });

    // Delete used verification token
    await prisma.verificationToken.deleteMany({
      where: {
        userId: decoded.userId,
        token,
      },
    });

    // Send welcome email
    await sendWelcomeEmail(user.email, user.name || "Seeker");

    logger.info(`Email verified for user: ${user.email}`);

    return NextResponse.json({
      message: "Email verified successfully",
      email: user.email,
    });
  } catch (error) {
    logger.error({ error }, "Verification error");

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Verification failed" },
      { status: 400 }
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
    // Verify token
    const decoded = await verifyToken(token, "email_verification");

    // Update user's email verification status
    const user = await prisma.user.update({
      where: { id: decoded.userId },
      data: {
        emailVerified: new Date(),
      },
    });

    // Delete used verification token
    await prisma.verificationToken.deleteMany({
      where: {
        userId: decoded.userId,
        token,
      },
    });

    // Send welcome email
    await sendWelcomeEmail(user.email, user.name || "Seeker");

    logger.info(`Email verified for user: ${user.email}`);

    // Redirect to success page
    const locale = user.preferredLanguage || 'en';
    return NextResponse.redirect(new URL(`/${locale}/auth/verified`, request.url));

  } catch (error) {
    logger.error({ error }, 'Verification error');
    return NextResponse.redirect(new URL('/auth/error?error=VerificationFailed', request.url));
  }
}