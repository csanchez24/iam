import type { UserCookie } from '@/auth/types';

import { SessionManager } from '@/auth/libs/session-manager';
import { parseError, stringifyError } from '@/auth/utils/error-response';
import { parseSearchParams } from '@/auth/utils/parse-search-params';
import { env } from '@/env';
import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';

const searchParamsSchema = z.object({
  code: z.string().min(1),
  state: z.string(),
});

/**
 *---------------------------------------------------------------------------------------------
 * GET /api/auth/callback
 *
 * This endpoint completes the oauth pipeline flow by receiving the code and requesting a
 * token(s) in exchange. Once the token(s) is received it manages the session in the cookies.
 *
 * Search parameters involved/required in this step:
 * 1. code
 *    > The code we received from the `/oauth2/token` step that we'll use to validate request
 * 2. client_id
 *    > The client_id is the public identifier for the app.
 * 3. client_secret
 *    > The private client_secret we'll use to validate app and create access token with
 * 4. redirect_url
 *    > Same as the one found in the initiate step
 * 5. grant_type
 *    > The client credentials grant type provides an application a way to access its own
 *      service account. Examples of when this might be useful include if an application
 *      wants to update its registered description or redirect URL, or access other data
 *      stored in its service account via the API. Grant_type can be 'authorization_code'
 *      or 'refresh_token'
 * --------------------------------------------------------------------------------------------
 */
export async function GETCallback(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;

    const parsedSearchParams = parseSearchParams(searchParams, searchParamsSchema);

    if (!parsedSearchParams.success) {
      throw stringifyError({
        message:
          Object.values(parsedSearchParams.error.flatten().fieldErrors).at(0)?.at(0) ??
          'Something is wrong with the search parameters.',
        status: 400,
      });
    }

    const sm = new SessionManager();

    // Get the state cookie
    const state = sm.getSession('fcf_iam_state');

    // Validate state by comparing cookie's state against search params's state
    if (!(state && state.id === parsedSearchParams.data.state)) {
      throw stringifyError({ message: 'Unable to process request', status: 400 });
    }

    const url = new URL('/api/oauth2/token', env.FCF_IAM_API_URL);
    url.searchParams.set('code', parsedSearchParams.data.code);
    url.searchParams.set('client_id', env.FCF_IAM_CLIENT_ID);
    url.searchParams.set('client_secret', env.FCF_IAM_CLIENT_SECRET);
    url.searchParams.set('redirect_url', env.FCF_IAM_APP_CALLBACK_URL);
    url.searchParams.set('grant_type', 'authorization_code');

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    if (res.status >= 400) {
      const data = (await res.json()) as { message: string; status: number };
      throw stringifyError({ message: data.message, status: data.status });
    }

    const data = (await res.json()) as {
      accessToken: string;
      refreshToken: string;
      idToken: string;
      user: UserCookie;
    };

    // I think we should redirect to an error page or something?
    if (!state.postLoginRedirectUrl) {
      throw stringifyError({ message: 'Missing post redirect url', status: 400 });
    }

    // Set the cookies
    sm.removeSession('fcf_iam_state');
    sm.setSession('fcf_iam_id_token', data.idToken);
    sm.setSession('fcf_iam_access_token', data.accessToken);
    sm.setSession('fcf_iam_refresh_token', data.refreshToken);
    sm.setSession('fcf_iam_user', data.user);

    return NextResponse.redirect(state.postLoginRedirectUrl);
  } catch (e) {
    const [{ message }] = parseError(e);
    const url = new URL('/oauth-error', env.FCF_IAM_APP_URL);
    url.searchParams.set('message', message);
    url.searchParams.set('redirect_url', env.FCF_IAM_POST_LOGIN_REDIRECT_URL);
    return Response.redirect(url, 307);
  }
}
