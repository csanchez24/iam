import type { AccessToken, IdToken, UserToken } from '../types';

import { getTokenPayload } from '@/auth/libs/server-side-fns';
import { env } from '@/env';
import { NextResponse, type NextRequest } from 'next/server';
import { SESSION_COOKIE_NAMES } from '../constants';

export function withAuth(
  req: NextRequest,
  options?: {
    postLoginRedirectURL?: string;
    loginPathname?: string;
    publicPaths?: string[] | '*' | RegExp;
    redirectToCurrentPage?: boolean;
    redirectURLBase?: string;
    shouldAuthorize?(params: {
      req: NextRequest;
      accessToken: AccessToken;
      idToken: IdToken;
    }): boolean;
  },
  onSuccess?: (params: {
    accessToken: AccessToken | undefined;
    user: UserToken & { id: number };
  }) => void
) {
  const { pathname } = req.nextUrl;

  // Skip validation when in a public path as defined by the `publicPaths` argument
  if (isPublicPath(pathname, options?.publicPaths)) {
    return;
  }

  const accessToken = getTokenPayload('fcf_iam_access_token');
  const idToken = getTokenPayload('fcf_iam_id_token');

  if (!(accessToken && idToken)) {
    const url = new URL(
      options?.loginPathname ?? '/api/auth/login',
      options?.redirectURLBase ?? env.FCF_IAM_APP_URL
    );

    if (options?.postLoginRedirectURL) {
      url.searchParams.set('post_login_redirect_url', options.postLoginRedirectURL);
    }

    const response = NextResponse.redirect(url);

    SESSION_COOKIE_NAMES.forEach((c) => {
      response.cookies.delete(c);
    });

    return response;
  }

  const isAuthorized =
    options?.shouldAuthorize?.({ req, accessToken, idToken }) ?? isTokenValid(accessToken);

  if (isAuthorized) {
    return onSuccess?.({
      accessToken,
      user: {
        id: idToken.sub,
        given_name: idToken.given_name,
        family_name: idToken.family_name,
        name: idToken.name,
        email: idToken.email,
        phone: idToken.phone,
        is_active: idToken.is_active,
        is_admin: idToken.is_admin,
        is_super_admin: idToken.is_super_admin,
      },
    });
  }

  // At this point we have a valid access token, however, we aren't authorize to
  // access the current path. Redirect user back to the home page '/'
  // return NextResponse.redirect(new URL(options?.redirectURLBase ?? env.FCF_IAM_APP_URL));
  // Given Nextjs cache issues we don't how to handle this from the server side. Let's just
  // continue to the page and handle the redirect within the client
  // return NextResponse.next();
  return NextResponse.next();
}

function isPublicPath(pathname: string, paths: string[] | '*' | RegExp | undefined) {
  if (paths instanceof RegExp) {
    return paths.test(pathname);
  }
  if (Array.isArray(paths)) {
    return paths.some((p) => pathname.startsWith(p));
  }
  if (paths === '*') {
    return true;
  }
  return false;
}

function isTokenValid(tokenPayload: AccessToken) {
  if (!tokenPayload) return false;

  if (
    tokenPayload.iss === env.FCF_IAM_ISSUER_URL &&
    tokenPayload.exp &&
    tokenPayload.exp > Math.floor(Date.now() / 1000)
  ) {
    return true;
  }

  return false;
}
