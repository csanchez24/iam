import type { NextRequest } from 'next/server';

import { ALLOWED_SCOPES } from '@/auth/constants';
import { SessionManager } from '@/auth/libs/session-manager';
import { parseError, stringifyError } from '@/auth/utils/error-response';
import { parseSearchParams } from '@/auth/utils/parse-search-params';
import { env } from '@/env';
import { nanoid } from 'nanoid';
import { z } from 'zod';

const searchParamsSchema = z.object({
  post_login_redirect_url: z.string().url().optional(),
});

/**
 * --------------------------------------------------------------------------------------------
 * GET /api/auth/login?post_login_redirect_url=[non-required redirect url]
 *
 * This endpoint initiates the oauth2 pipeline flow. It creates the state and redirects
 * the user to the authorization server to complete the login step.
 *
 * Search parameters involved/required in this step:
 * 1. response_type
 *    > Indicates response type e.g. `code` or `token`.
 * 2. client_id
 *    > public identifier for the app.
 * 3. redirect_url
 *    > The redirect_url is not required by the spec, but your service should require it.
 *      This URL must match one of the URLs the developer registered when creating the
 *      application, and the authorization server should reject the request if it does not match.
 * 4. scope
 *    > The request may have one or more scope values indicating additional access requested
 *      by the application.
 * 5. state
 *    > The state parameter is used by the application to store request-specific data
 *      and/or prevent CSRF attacks. The authorization server must return the unmodified state
 *      value back to the application.
 * --------------------------------------------------------------------------------------------
 */
export function GETLogin(req: NextRequest) {
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

    const postLoginRedirectUrl =
      parsedSearchParams.data.post_login_redirect_url ?? env.FCF_IAM_POST_LOGIN_REDIRECT_URL;

    if (!postLoginRedirectUrl) {
      throw stringifyError({
        message: 'Missing post login url to redirect to following authentication.',
        status: 400,
      });
    }

    const state = nanoid();

    sm.setSession('fcf_iam_state', {
      id: state,
      postLoginRedirectUrl:
        parsedSearchParams.data.post_login_redirect_url ?? env.FCF_IAM_POST_LOGIN_REDIRECT_URL,
    });

    const url = new URL('/api/oauth2/authorize', env.FCF_IAM_API_URL);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('client_id', env.FCF_IAM_CLIENT_ID);
    url.searchParams.set('redirect_url', env.FCF_IAM_APP_CALLBACK_URL);
    url.searchParams.set('scope', ALLOWED_SCOPES.join(' '));
    url.searchParams.set('state', state);
    return Response.redirect(url, 307);
  } catch (e) {
    const [{ message }] = parseError(e);
    const url = new URL('/oauth-error', env.FCF_IAM_APP_URL);
    url.searchParams.set('message', message);
    url.searchParams.set('redirect_url', env.FCF_IAM_POST_LOGIN_REDIRECT_URL);
    return Response.redirect(url, 307);
  }
}
