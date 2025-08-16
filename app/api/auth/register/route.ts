import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db/client";
import { sendVerificationEmail } from "@/lib/email/verification";
import { generateVerificationToken } from "@/lib/auth/tokens";
import logger from "@/lib/logger";

const registerSchema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(8)
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      "Password must contain uppercase, lowercase, number and special character"
    ),
  name: z.string().min(2).max(50),
  preferredLanguage: z.string().default("en"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, name, preferredLanguage } =
      registerSchema.parse(body);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hash(password, 12);

    // Generate verification token first
    const userId = crypto.randomUUID(); // Generate temporary ID for token
    const verificationToken = await generateVerificationToken(userId);

    // Create user with related records in a transaction
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          id: userId,
          email,
          password: hashedPassword,
          name,
          preferredLanguage,
          spiritualProfile: {
            create: {
              currentLevel: "SEEKER",
            },
          },
          preferences: {
            create: {
              theme: "ancient",
              aiVerbosity: "BALANCED",
            },
          },
        },
        include: {
          spiritualProfile: true,
          preferences: true,
        },
      });

      // Store token in database
      await tx.verificationToken.create({
        data: {
          userId: newUser.id,
          token: verificationToken,
          type: "EMAIL_VERIFICATION",
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        },
      });

      return newUser;
    });

    // Send verification email
    await sendVerificationEmail(
      user.email,
      user.name || "Seeker",
      verificationToken
    );

    logger.info(`New user registered: ${email}`);

    return NextResponse.json({
      message:
        "Registration successful. Please check your email to verify your account.",
      userId: user.id,
    });
  } catch (error) {
    logger.error({ error }, "Registration error");

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}