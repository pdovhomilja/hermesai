import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      preferredLanguage?: string
    } & DefaultSession["user"]
  }

  interface User {
    preferredLanguage?: string
    emailVerified?: Date | null
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    preferredLanguage?: string
  }
}