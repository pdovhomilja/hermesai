import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { prisma } from "@/lib/db/client";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function generateVerificationToken(
  userId: string
): Promise<string> {
  const token = jwt.sign(
    {
      userId,
      type: "email_verification",
      jti: uuidv4(),
    },
    JWT_SECRET,
    { expiresIn: "24h" }
  );

  return token;
}

export async function generatePasswordResetToken(
  userId: string
): Promise<string> {
  const token = jwt.sign(
    {
      userId,
      type: "password_reset",
      jti: uuidv4(),
    },
    JWT_SECRET,
    { expiresIn: "1h" }
  );

  return token;
}

export async function verifyToken(token: string, type: string) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    if (decoded.type !== type) {
      throw new Error("Invalid token type");
    }

    return decoded;
  } catch (error) {
    throw new Error("Invalid or expired token");
  }
}