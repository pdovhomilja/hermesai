# Phase 2: Authentication System Enhancement

## Overview

This phase enhances the existing authentication system with comprehensive user management, secure registration, email verification, password reset, and session management using NextAuth.js v5 with the database schema from Phase 1.

## Prerequisites

- Phase 1 completed (Database infrastructure ready)
- NextAuth.js v5 installed ✅
- Email service (Resend) configured ✅

## Phase Objectives

1. Enhance NextAuth configuration with database adapter
2. Implement secure user registration with email verification
3. Add password reset functionality
4. Create protected route middleware
5. Implement session management
6. Add OAuth providers (Google, GitHub)
7. Create user profile management

## Implementation Steps

### Step 1: Install Additional Dependencies

```bash
pnpm add @auth/prisma-adapter
pnpm add bcryptjs jsonwebtoken
pnpm add -D @types/bcryptjs @types/jsonwebtoken
pnpm add uuid
pnpm add -D @types/uuid
```

### Step 2: Environment Variables

Update `.env.local`:

```env
# Authentication
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-a-32-character-secret-here"

# OAuth Providers (optional for now)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""

# Email
RESEND_API_KEY="your-resend-api-key"
EMAIL_FROM="noreply@ialchemist.app"

# Security
JWT_SECRET="generate-another-32-character-secret"
VERIFICATION_TOKEN_EXPIRES_IN="24h"
PASSWORD_RESET_TOKEN_EXPIRES_IN="1h"

# URLs
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Step 3: Enhanced Authentication Configuration

Update `auth.ts`:

```typescript
import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import { prisma } from "@/lib/db/client";
import { compare } from "bcryptjs";
import { z } from "zod";
import logger from "@/lib/logger";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
    error: "/auth/error",
    verifyRequest: "/auth/verify",
    newUser: "/onboarding",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const { email, password } = loginSchema.parse(credentials);

          const user = await prisma.user.findUnique({
            where: { email },
            include: {
              spiritualProfile: true,
              preferences: true,
            },
          });

          if (!user || !user.password) {
            logger.warn(`Failed login attempt for ${email}`);
            return null;
          }

          const isValidPassword = await compare(password, user.password);

          if (!isValidPassword) {
            logger.warn(`Invalid password for ${email}`);
            return null;
          }

          if (!user.emailVerified) {
            logger.warn(`Unverified email login attempt for ${email}`);
            throw new Error("Please verify your email before signing in");
          }

          // Update last active timestamp
          await prisma.user.update({
            where: { id: user.id },
            data: { lastActiveAt: new Date() },
          });

          logger.info(`Successful login for ${email}`);

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            preferredLanguage: user.preferredLanguage,
            emailVerified: user.emailVerified,
          };
        } catch (error) {
          logger.error("Authorization error:", error);
          return null;
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  callbacks: {
    async jwt({ token, user, account, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.preferredLanguage = user.preferredLanguage;
      }

      if (trigger === "update" && session) {
        token = { ...token, ...session };
      }

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.preferredLanguage = token.preferredLanguage as string;
      }

      return session;
    },
    async signIn({ user, account }) {
      // Allow OAuth sign-ins
      if (account?.provider !== "credentials") {
        return true;
      }

      // For credentials, check if email is verified
      const existingUser = await prisma.user.findUnique({
        where: { email: user.email! },
      });

      return !!existingUser?.emailVerified;
    },
  },
  events: {
    async signIn({ user }) {
      logger.info(`User signed in: ${user.email}`);
      await prisma.user.update({
        where: { id: user.id! },
        data: { lastActiveAt: new Date() },
      });
    },
    async signOut({ token }) {
      logger.info(`User signed out: ${token?.email}`);
    },
    async createUser({ user }) {
      logger.info(`New user created: ${user.email}`);

      // Create spiritual profile for new user
      await prisma.spiritualProfile.create({
        data: {
          userId: user.id!,
          currentLevel: "SEEKER",
        },
      });

      // Create default preferences
      await prisma.userPreference.create({
        data: {
          userId: user.id!,
        },
      });
    },
  },
  debug: process.env.NODE_ENV === "development",
});
```

### Step 4: Registration API Route

Update `app/api/auth/register/route.ts`:

```typescript
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

    // Create user with related records in a transaction
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
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

      // Generate verification token
      const verificationToken = await generateVerificationToken(newUser.id);

      // Store token in database
      await tx.verificationToken.create({
        data: {
          userId: newUser.id,
          token: verificationToken,
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
    logger.error("Registration error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
```

### Step 5: Email Verification System

Create `lib/auth/tokens.ts`:

```typescript
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
```

Create `lib/email/verification.ts`:

```typescript
import { Resend } from "resend";
import VerificationEmail from "@/emails/templates/verify-email";
import WelcomeEmail from "@/emails/templates/welcome-email";
import PasswordResetEmail from "@/emails/templates/password-reset";

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
      name,
      verificationUrl,
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
      name,
      loginUrl: `${process.env.NEXT_PUBLIC_APP_URL}/auth/signin`,
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

  const { error } = await resend.emails.send({
    from: process.env.EMAIL_FROM!,
    to: email,
    subject: "Reset your IALchemist password",
    react: PasswordResetEmail({
      name,
      resetUrl,
    }),
  });

  if (error) {
    throw new Error(`Failed to send password reset email: ${error.message}`);
  }
}
```

### Step 6: Verification API Route

Create `app/api/auth/verify/route.ts`:

```typescript
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
    logger.error("Verification error:", error);

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Verification failed" },
      { status: 400 }
    );
  }
}
```

### Step 7: Update Prisma Schema for Tokens

Add to `prisma/schema.prisma`:

```prisma
model VerificationToken {
  id        String   @id @default(cuid())
  userId    String
  token     String   @unique
  type      TokenType @default(EMAIL_VERIFICATION)
  expires   DateTime
  createdAt DateTime @default(now())

  user      User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([token])
  @@index([expires])
}

enum TokenType {
  EMAIL_VERIFICATION
  PASSWORD_RESET
  MAGIC_LINK
}
```

### Step 8: Middleware for Protected Routes

Update `middleware.ts`:

```typescript
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import type { NextRequest } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

const intlMiddleware = createIntlMiddleware(routing);

const publicPaths = [
  "/auth/signin",
  "/auth/register",
  "/auth/verify",
  "/auth/reset-password",
  "/auth/error",
  "/api/auth",
];

const protectedPaths = [
  "/dashboard",
  "/chat",
  "/profile",
  "/settings",
  "/spiritual-journey",
];

export default async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // Remove locale from pathname for path checking
  const pathnameWithoutLocale =
    pathname.replace(/^\/[a-z]{2}(-[A-Z]{2})?/, "") || "/";

  // Check if path is public
  const isPublicPath = publicPaths.some((path) =>
    pathnameWithoutLocale.startsWith(path)
  );

  // Check if path is protected
  const isProtectedPath = protectedPaths.some((path) =>
    pathnameWithoutLocale.startsWith(path)
  );

  // Get session
  const session = await auth();

  // Redirect logic
  if (isProtectedPath && !session) {
    const url = new URL("/auth/signin", req.url);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  if (isPublicPath && session && pathnameWithoutLocale === "/auth/signin") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Apply internationalization
  return intlMiddleware(req);
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
```

### Step 9: Session Provider Setup

Update `app/[locale]/layout.tsx`:

```typescript
import { auth } from "@/auth";
import { SessionProvider } from "next-auth/react";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const session = await auth();
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body>
        <SessionProvider session={session}>
          <NextIntlClientProvider messages={messages}>
            {children}
          </NextIntlClientProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
```

### Step 10: Create Auth Hooks

Create `hooks/use-auth.ts`:

```typescript
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

export function useAuth() {
  const { data: session, status, update } = useSession();
  const router = useRouter();

  const isLoading = status === "loading";
  const isAuthenticated = !!session?.user;

  const updateProfile = useCallback(
    async (data: any) => {
      await update(data);
    },
    [update]
  );

  const redirectToSignIn = useCallback(
    (callbackUrl?: string) => {
      const url = new URL("/auth/signin", window.location.origin);
      if (callbackUrl) {
        url.searchParams.set("callbackUrl", callbackUrl);
      }
      router.push(url.toString());
    },
    [router]
  );

  return {
    session,
    user: session?.user,
    isLoading,
    isAuthenticated,
    updateProfile,
    redirectToSignIn,
  };
}
```

## Verification Steps

1. Run database migration for new token model:

```bash
pnpm prisma migrate dev --name add_verification_tokens
```

2. Test user registration:

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!@#","name":"Test User"}'
```

3. Test email verification flow
4. Test sign in with credentials
5. Test protected route access

6. Run linting and build:

```bash
pnpm lint
pnpm build
```

## Success Criteria

- [ ] User registration works with email verification
- [ ] Email verification completes successfully
- [ ] Sign in with credentials works
- [ ] Protected routes redirect unauthenticated users
- [ ] Session management works correctly
- [ ] OAuth providers configured (optional for MVP)
- [ ] No linting errors
- [ ] Build completes successfully

## Next Phase

Phase 3 will integrate Vercel AI SDK v5 for the core chat functionality with Hermes Trismegistus.
