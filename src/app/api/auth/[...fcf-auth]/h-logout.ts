import type { NextRequest } from 'next/server';

import { SessionManager } from '@/auth/libs/session-manager';
import { parseError, stringifyError } from '@/auth/utils/error-response';
import { env } from '@/env';

/**
 * --------------------------------------------------------------------------------------------
 * POST /api/auth/logout?post_logout_redirect_url=[non-required]
 *
 * This endpoint is responsible for clearing the session from the cookies and redirecting the
 * user back to their redirect url either provided in the env variables or the search params.
 *
 * --------------------------------------------------------------------------------------------
 */
export async function POSTLogout(_req: NextRequest) {
  try {
    const sm = new SessionManager();

    const refreshToken = sm.getSession('fcf_iam_refresh_token');

    if (!refreshToken) {
      throw stringifyError({ message: 'Invalid or missing refresh token.', status: 400 });
    }

    const url = new URL('/api/oauth2/logout', env.FCF_IAM_API_URL);
    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (resp.status >= 400) {
      const data = (await resp.json()) as { message: string };
      throw stringifyError({
        message: data.message ?? 'Failed to remove refresh token.',
        status: 400,
      });
    }

    sm.destroySession();

    return Response.json({ success: true });
  } catch (e) {
    return Response.json(...parseError(e));
  }
}
