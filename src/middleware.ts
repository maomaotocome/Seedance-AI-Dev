import { NextRequest, NextResponse } from 'next/server';
import { getSessionCookie } from 'better-auth/cookies';
import createIntlMiddleware from 'next-intl/middleware';

import { routing } from '@/core/i18n/config';
import { envConfigs } from '@/config';

const intlMiddleware = createIntlMiddleware(routing);
const canonicalHostname = new URL(envConfigs.app_url).hostname;

export async function middleware(request: NextRequest) {
  const forwardedProto = request.headers.get('x-forwarded-proto');
  const isLocalhost =
    request.nextUrl.hostname === 'localhost' ||
    request.nextUrl.hostname === '::1' ||
    /^127\./.test(request.nextUrl.hostname);
  const isPrivateDevelopmentHost =
    process.env.NODE_ENV === 'development' &&
    (request.nextUrl.hostname === '0.0.0.0' ||
      /^10\./.test(request.nextUrl.hostname) ||
      /^192\.168\./.test(request.nextUrl.hostname) ||
      /^172\.(1[6-9]|2\d|3[01])\./.test(request.nextUrl.hostname));
  const shouldRedirectToHttps =
    !isLocalhost &&
    !isPrivateDevelopmentHost &&
    (request.nextUrl.protocol === 'http:' || forwardedProto === 'http');
  const shouldRedirectWwwToApex =
    request.nextUrl.hostname === `www.${canonicalHostname}`;

  if (shouldRedirectToHttps || shouldRedirectWwwToApex) {
    const httpsUrl = request.nextUrl.clone();
    httpsUrl.protocol = 'https:';
    if (shouldRedirectWwwToApex) {
      httpsUrl.hostname = canonicalHostname;
      httpsUrl.port = '';
    }
    return NextResponse.redirect(httpsUrl, 308);
  }

  const { pathname } = request.nextUrl;

  // Handle internationalization first
  const intlResponse = intlMiddleware(request);

  // Extract locale from pathname
  const locale = pathname.split('/')[1];
  const isValidLocale = routing.locales.includes(locale as any);
  const pathWithoutLocale = isValidLocale
    ? pathname.slice(locale.length + 1)
    : pathname;

  // Only check authentication for admin routes
  if (
    pathWithoutLocale.startsWith('/admin') ||
    pathWithoutLocale.startsWith('/settings') ||
    pathWithoutLocale.startsWith('/activity')
  ) {
    // Check if session cookie exists
    const sessionCookie = getSessionCookie(request);

    // If no session token found, redirect to sign-in
    if (!sessionCookie) {
      const signInUrl = new URL(
        isValidLocale ? `/${locale}/sign-in` : '/sign-in',
        request.url
      );
      // Add the current path (including search params) as callback - use relative path for multi-language support
      const callbackPath = pathWithoutLocale + request.nextUrl.search;
      signInUrl.searchParams.set('callbackUrl', callbackPath);
      return NextResponse.redirect(signInUrl);
    }

    // For admin routes, we need to check RBAC permissions
    // Note: Full permission check happens in the page/API route level
    // This is a lightweight session check to prevent unauthorized access
    // The detailed permission check (admin.access and specific permissions)
    // will be done in the layout or individual pages using requirePermission()
  }

  intlResponse.headers.set('x-pathname', request.nextUrl.pathname);
  intlResponse.headers.set('x-url', request.url);

  // Remove Set-Cookie from public pages to allow caching
  // We exclude admin, settings, activity, and auth pages from this behavior
  if (
    !pathWithoutLocale.startsWith('/admin') &&
    !pathWithoutLocale.startsWith('/settings') &&
    !pathWithoutLocale.startsWith('/activity') &&
    !pathWithoutLocale.startsWith('/sign-') &&
    !pathWithoutLocale.startsWith('/auth')
  ) {
    intlResponse.headers.delete('Set-Cookie');

    // Cache-Control header for public pages
    const cacheControl = 'public, s-maxage=3600, stale-while-revalidate=14400';

    intlResponse.headers.set('Cache-Control', cacheControl);
    intlResponse.headers.set('CDN-Cache-Control', cacheControl);
    intlResponse.headers.set('Cloudflare-CDN-Cache-Control', cacheControl);
  }

  // For all other routes (including /, /sign-in, /sign-up, /sign-out), just return the intl response
  return intlResponse;
}

export const config = {
  matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)',
};
