import { NextRequest, NextResponse } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';
import { auth } from './auth';
import { routing } from './i18n/routing';

const intlMiddleware = createIntlMiddleware(routing);

const publicPages = ['/', '/auth/signin', '/auth/error', '/auth/verified'];

function isPublicPage(pathname: string) {
  // Check if the pathname (without locale) matches any public page
  const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}(\/|$)/, '/');
  
  return publicPages.some(page => {
    if (page === '/') {
      return pathWithoutLocale === '/' || pathname === '/';
    }
    return pathWithoutLocale.startsWith(page) || pathname.startsWith(page);
  });
}

export default async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Skip middleware for API routes, static files, and NextAuth API routes
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/_vercel/') ||
    pathname.includes('.') ||
    pathname.includes('/api/auth')
  ) {
    return NextResponse.next();
  }

  // Always apply i18n middleware first
  const intlResponse = intlMiddleware(request);
  
  // If it's a public page, just return the i18n response
  if (isPublicPage(pathname)) {
    return intlResponse;
  }

  // For protected pages, check authentication
  try {
    const session = await auth();
    
    if (!session?.user) {
      // Extract locale from pathname or use default
      const segments = pathname.split('/').filter(Boolean);
      const firstSegment = segments[0];
      const locale = routing.locales.includes(firstSegment as any) ? firstSegment : routing.defaultLocale;
      
      // Redirect to sign-in page with proper locale
      const signInUrl = new URL(`/${locale}/auth/signin`, request.url);
      return NextResponse.redirect(signInUrl);
    }

    // Check if user is accessing their own company route
    const segments = pathname.split('/').filter(Boolean);
    const locale = routing.locales.includes(segments[0] as any) ? segments[0] : null;
    const requestedCid = locale ? segments[1] : segments[0];
    const userCid = session.user.cid;

    // If this is a company-specific route and user doesn't match, redirect to their company
    if (requestedCid && userCid && requestedCid !== userCid) {
      const userLocale = locale || routing.defaultLocale;
      const userCompanyUrl = new URL(`/${userLocale}/${userCid}`, request.url);
      return NextResponse.redirect(userCompanyUrl);
    }
  } catch (error) {
    // If auth fails, redirect to signin
    const locale = routing.defaultLocale;
    const signInUrl = new URL(`/${locale}/auth/signin`, request.url);
    return NextResponse.redirect(signInUrl);
  }

  return intlResponse;
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