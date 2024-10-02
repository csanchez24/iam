import type { NextRequest } from 'next/server';

import { parseError, stringifyError } from '@/auth/utils/error-response';
import { parseSearchParams } from '@/auth/utils/parse-search-params';
import { db } from '@/server/db';
import { authorizationCodes, authorizationRequests, users } from '@/server/db/schema';
import { verifyPassword } from '@/server/utils/password';
import { and, eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { z } from 'zod';

const credentialsSchema = z.object({ email: z.string().email(), password: z.string().min(6) });

const searchParamsSchema = z.object({
  pid: z.string().uuid(),
});

/**
 * --------------------------------------------------------------------------------------------
 * POST - /api/oauth2/login?pid<public session id obtained while intiating flow>
 *
 * This route is responsible for validating search parameters and creating code we'll use
 * later on in the process to exchange for token.
 * --------------------------------------------------------------------------------------------
 */
export async function POSTLogin(req: NextRequest) {
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

    const { email, password } = (await req.json()) as z.infer<typeof credentialsSchema>;

    const parsed = credentialsSchema.safeParse({ email, password });
    if (!parsed.success) {
      throw stringifyError({
        message:
          parsed.error.flatten().formErrors.at(0) ?? 'Something is wrong with the credentials.',
        status: 400,
      });
    }

    // Search for user in db
    const [user] = await db
      .select()
      .from(users)
      .where(and(eq(users.email, email), eq(users.isActive, true)));
    if (!user) {
      throw stringifyError({ message: `No user found with email: ${email}.`, status: 400 });
    }

    // Validate user's password
    const verified = await verifyPassword(password, user.password);
    if (!verified) {
      throw stringifyError({ message: `Unable to verify credentials.`, status: 400 });
    }

    const [authorizationRequest] = await db
      .select()
      .from(authorizationRequests)
      .where(eq(authorizationRequests.pid, parsedSearchParams.data.pid));

    if (!authorizationRequest) {
      throw stringifyError({ message: 'Missing authorization request.', status: 400 });
    }

    const code = nanoid(33);

    await db.transaction(async (tx) => {
      await tx.insert(authorizationCodes).values({
        clientId: authorizationRequest.clientId,
        scope: authorizationRequest.scope,
        redirectUrl: authorizationRequest.redirectUrl,
        responseType: authorizationRequest.responseType,
        userId: user.id,
        code,
      });

      await tx
        .delete(authorizationRequests)
        .where(eq(authorizationRequests.id, authorizationRequest.id));

      return;
    });

    return Response.json({
      code,
      state: authorizationRequest.state,
      redirectUrl: authorizationRequest.redirectUrl,
    });
  } catch (e) {
    return Response.json(...parseError(e));
  }
}
