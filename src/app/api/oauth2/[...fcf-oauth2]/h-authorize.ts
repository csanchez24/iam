import type { NextRequest } from 'next/server';

import { parseError, stringifyError } from '@/auth/utils/error-response';
import { parseSearchParams } from '@/auth/utils/parse-search-params';
import { env } from '@/env';
import { db } from '@/server/db';
import { applications, authorizationRequests } from '@/server/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const ALLOWED_SCOPES = ['email', 'profile', 'openid'];

const searchParamsSchema = z.object({
  response_type: z.literal('code'),
  client_id: z.string().uuid(),
  redirect_url: z.string().url(),
  scope: z.string().refine((v) => v?.split(' ').every((s) => ALLOWED_SCOPES.includes(s))),
  state: z.string(),
});

/**
 * --------------------------------------------------------------------------------------------
 * GET - /api/oauth2/authorize?...oauth2_search_params
 *
 * This handler is responsible for validating search parameters and creating 'code' we'll
 * later used during the process of exchanging it for token.
 * --------------------------------------------------------------------------------------------
 */
export async function GETAuthorize(req: NextRequest) {
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

    // Validate application's existance with given client id
    const [application] = await db
      .select()
      .from(applications)
      .where(eq(applications.clientId, parsedSearchParams.data.client_id));

    if (!application) {
      throw stringifyError({
        message: `No application found with client_id: ${parsedSearchParams.data.client_id}`,
        status: 400,
      });
    }

    // Validate redirect_url is in the allowed application's callback urls list
    if (application.callbackUrl !== parsedSearchParams.data.redirect_url) {
      throw stringifyError({
        message: `Invalid redirect_url: ${parsedSearchParams.data.redirect_url}. You can find/add callback urls under application settings.`,
        status: 400,
      });
    }

    const { scope, state, response_type, redirect_url, client_id } = parsedSearchParams.data;

    // Add entry to authorization_requests table to begin our oauth pipeline flow
    const pid = crypto.randomUUID();
    await db.insert(authorizationRequests).values({
      responseType: response_type,
      redirectUrl: redirect_url,
      clientId: client_id,
      pid,
      scope,
      state,
    });

    const url = new URL('/login', env.FCF_IAM_APP_URL);
    url.searchParams.set('pid', pid);
    return Response.redirect(url, 307);
  } catch (e) {
    const [{ message }] = parseError(e);
    const url = new URL('/oauth-error', env.FCF_IAM_APP_URL);
    url.searchParams.set('message', message);
    url.searchParams.set('redirect_url', env.FCF_IAM_POST_LOGIN_REDIRECT_URL);
    return Response.redirect(url, 307);
  }
}
