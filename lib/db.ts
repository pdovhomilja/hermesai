import { PrismaClient } from '../lib/generated/prisma';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// User operations
export async function createUser(email: string, password: string, locale: string = 'en') {
  const hashedPassword = await bcrypt.hash(password, 12);
  const verificationToken = randomBytes(32).toString('hex');
  const tokenExpires = new Date();
  tokenExpires.setHours(tokenExpires.getHours() + 24); // 24 hour expiry

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      emailVerificationToken: verificationToken,
      emailTokenExpires: tokenExpires,
      preferredLanguage: locale,
    },
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      locale: user.preferredLanguage,
    },
    verificationToken,
  };
}

export async function getUserByEmail(email: string) {
  return await prisma.user.findUnique({
    where: { email },
  });
}

export async function getUserById(id: string) {
  return await prisma.user.findUnique({
    where: { id },
  });
}

export async function verifyPassword(password: string, hashedPassword: string) {
  return await bcrypt.compare(password, hashedPassword);
}

export async function verifyUserEmail(token: string) {
  const user = await prisma.user.findUnique({
    where: { 
      emailVerificationToken: token,
    },
  });

  if (!user) {
    return { success: false, error: 'Invalid verification token' };
  }

  if (user.emailTokenExpires && user.emailTokenExpires < new Date()) {
    return { success: false, error: 'Verification token has expired' };
  }

  // Update user as verified
  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerified: new Date(),
      emailVerificationToken: null,
      emailTokenExpires: null,
    },
  });

  return { 
    success: true, 
    user: {
      id: updatedUser.id,
      email: updatedUser.email,
      emailVerified: updatedUser.emailVerified,
      locale: updatedUser.preferredLanguage,
    }
  };
}

export async function generateNewVerificationToken(email: string) {
  const verificationToken = randomBytes(32).toString('hex');
  const tokenExpires = new Date();
  tokenExpires.setHours(tokenExpires.getHours() + 24); // 24 hour expiry

  const user = await prisma.user.update({
    where: { email },
    data: {
      emailVerificationToken: verificationToken,
      emailTokenExpires: tokenExpires,
    },
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      locale: user.preferredLanguage,
    },
    verificationToken,
  };
}

export async function getUserByVerificationToken(token: string) {
  return await prisma.user.findUnique({
    where: { 
      emailVerificationToken: token,
    },
  });
}