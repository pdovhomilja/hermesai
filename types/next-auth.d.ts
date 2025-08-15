import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      cid: string | null
    } & DefaultSession["user"]
  }

  interface User {
    cid: string | null
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    cid: string | null
  }
}