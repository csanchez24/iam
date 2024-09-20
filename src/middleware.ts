import type { NextRequest } from 'next/server';

import { withAuth } from '@/auth/libs/middleware';
import { match } from '@formatjs/intl-localematcher';
import Negotiator from 'negotiator';
import { NextResponse } from 'next/server';
import { i18n } from './i18n/config';

// Pathname redirects
const redirects = {
  '/': {
    destination: '/users',
    permanent: false,
  },
};

/**
 * Given the req object read the browser's headers and sets `locale`
 * matching our list of supported i18n languages.
 *
 * @returns en | es | ...
 */
function getLocale(req: NextRequest): string | undefined {
  // Negotiator's headers e.g. { 'accept-language': 'en-US,en;q=0.5' }
  const negotiatorHeaders: Record<string, string> = {};
  req.headers.forEach((value, key) => (negotiatorHeaders[key] = value));

  // Supported locales. No need to difine country for Spanish
  // @ts-expect-error - Locales are readonly
  const locales: string[] = i18n.locales;

  const languages = new Negotiator({ headers: negotiatorHeaders }).languages(locales);

  return match(languages, locales, i18n.defaultLocale);
}

/**
 * Constructs url used to redirect user following completion of
 * login steps using multiple parameters from the req object.
 * By doing this we can ensure we're building the url correctly
 * in production(with the domain) and in development(with localhost).
 *
 * @returns string | undefined
 */
function getPostLoginRedirectURL(req: NextRequest) {
  // http: | https:
  const protocol = req.nextUrl.protocol;
  // /en/user
  const pathname = req.nextUrl.pathname;
  // fcf-brownbear.dev | localhost:3000
  const host = req.headers.get('host');

  if (!(protocol && host && !pathname.startsWith('/api'))) {
    return;
  }

  const url = new URL(pathname, protocol + '//' + host);
  req.nextUrl.searchParams.forEach((value, name) => url.searchParams.set(name, value));

  return url.toString();
}

export default function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // Check if there is any supported locale in the pathname
  const pathnameIsMissingLocale = i18n.locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  );

  // Redirect if there is no locale and we're not handling api requests
  if (pathnameIsMissingLocale && !pathname.startsWith('/api')) {
    const locale = getLocale(req);

    // Check for manual redirects given the current path
    const redirectEntry = redirects[pathname as keyof typeof redirects];

    // Take incoming request as `/users` and convert to `/en/users`
    const destination = redirectEntry
      ? `/${locale}/${redirectEntry.destination}`
      : `/${locale}${pathname.startsWith('/') ? '' : '/'}${pathname}`;

    // Check for `permanent` redirects else default to `temporary`
    const statusCode = redirectEntry?.permanent ? 308 : 307;

    // Create new url with added `/locale/{pathname}` and include search params
    const url = new URL(destination, req.url);
    req.nextUrl.searchParams.forEach((value, name) => url.searchParams.set(name, value));

    return NextResponse.redirect(url, statusCode);
  }

  return withAuth(req, {
    postLoginRedirectURL: getPostLoginRedirectURL(req),
    redirectToCurrentPage: true,
    publicPaths:
      /(\/api|\/login|\/oauth-error|\/password-reset(-code|-confirmation)?|\/api\/(o)?auth(2)?\/(callback|authorize|token|logout))\/?/gm,
  });
}

export const config = {
  matcher: [
    {
      // Match all request paths except for the ones starting with
      source: '/((?!_next/static|_next/image|favicon.ico|images|icons).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        // NOTE: Adding this line causes Google's Chrome to NOT set headers on mount
        // unless we force reload the page. Comment out until a fix is deployed.
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
};
