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
          logger.error({ error }, "Authorization error");
          return null;
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
    GitHubProvider({
      clientId: process.env.AUTH_GITHUB_ID!,
      clientSecret: process.env.AUTH_GITHUB_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  callbacks: {
    async jwt({ token, user, account, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.preferredLanguage = (user as any).preferredLanguage;
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
        (session.user as any).preferredLanguage = token.preferredLanguage as string;
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
    async signOut() {
      logger.info("User signed out");
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
