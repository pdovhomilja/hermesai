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
  matcher: [
    // Enable a redirect to a matching locale at the root
    '/',
    
    // Set a cookie to remember the previous locale for
    // all requests that have a locale prefix
    '/(de|en|es|fr|it|pt)/:path*',
    
    // Enable redirects that add missing locales
    // Exclude API routes, Next.js internals, and static files
    '/((?!api|_next|_vercel|.*\\..*).*)'
  ]
};