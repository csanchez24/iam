import type { NextRequest } from 'next/server';

import { Tk } from '@/auth/libs/tk';
import { parseError, stringifyError } from '@/auth/utils/error-response';
import { parseSearchParams } from '@/auth/utils/parse-search-params';
import { db } from '@/server/db';
import {
  applications,
  authorizationCodes,
  permissions,
  refreshTokens,
  rolesToPermissions,
  users,
  usersToRoles,
  type User,
} from '@/server/db/schema';
import { and, eq } from 'drizzle-orm';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import { z } from 'zod';

/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
const searchParamsSchema = z
  .object({
    // Common search params
    grant_type: z.union([z.literal('authorization_code'), z.literal('refresh_token')]),
    client_id: z.string().uuid(),
    redirect_url: z.string().url(),
    client_secret: z.string(),
    // Only required for `authorization_code` grant type
    code: z.string().min(1).optional(),
    // Only required for `refresh_token` grant type
    refresh_token: z.string().optional(),
  })
  .refine(
    (data) => {
      return (
        (data.grant_type === 'authorization_code' && data.code) ||
        (data.grant_type === 'refresh_token' && data.refresh_token)
      );
    },
    {
      message: '`code` and/or `refresh_token` is required given the grant_type',
      path: ['code', 'refresh_token'],
    }
  );
/* eslint-enable @typescript-eslint/prefer-nullish-coalescing */

/**
 * --------------------------------------------------------------------------------------------
 * POST - /api/oauth2/token?code=<code>&...oauth_search_params
 *
 * This route responsible validating the oauth search params along with the generated code
 * we'll use to create a token(s) and respond back to the client.
 * --------------------------------------------------------------------------------------------
 */
export async function POSTToken(req: NextRequest) {
  try {
    const parsed = parseSearchParams(req.nextUrl.searchParams, searchParamsSchema);

    if (!parsed.success) {
      throw stringifyError({
        message:
          Object.values(parsed.error.flatten().fieldErrors).at(0)?.at(0) ??
          'Something went wrong parsing search parameters.',
        status: 400,
      });
    }

    const [user, scope] =
      parsed.data.grant_type === 'authorization_code'
        ? await getUserAndScopeForAuthorizationCode({ searchParams: parsed.data })
        : await getUserAndScopeForRefreshToken({ searchParams: parsed.data });

    const [application] = await db
      .select()
      .from(applications)
      .where(eq(applications.clientId, parsed.data.client_id));

    if (!(application && application.sercretId === parsed.data.client_secret)) {
      throw stringifyError({ message: 'Invalid secret id.', status: 400 });
    }

    // Get user's permissions associated to application/client to make them available via access token
    const userPermissionsToApplication = (
      await db
        .selectDistinct({ key: permissions.key })
        .from(permissions)
        .innerJoin(rolesToPermissions, eq(rolesToPermissions.permissionId, permissions.id))
        .innerJoin(usersToRoles, eq(usersToRoles.roleId, rolesToPermissions.roleId))
        .where(and(eq(usersToRoles.userId, user.id), eq(permissions.applicationId, application.id)))
    ).map(({ key }) => key);

    const tk = new Tk(application, user, userPermissionsToApplication, scope);

    // Keep track of refresh tokens to mitigate 'replay attacks'
    const refreshTokenKey = crypto.randomUUID();
    await db.insert(refreshTokens).values({
      key: refreshTokenKey,
      token: tk.refreshToken,
      expiresAt: new Date(tk.decodedRefreshToken.exp),
    });

    return Response.json(
      {
        idToken: tk.idToken,
        accessToken: tk.accessToken,
        refreshToken: refreshTokenKey,
        user: tk.user,
      },
      { status: 200 }
    );
  } catch (e) {
    return Response.json(...parseError(e));
  }
}

async function getUserAndScopeForAuthorizationCode({
  searchParams,
}: {
  searchParams: z.infer<typeof searchParamsSchema>;
}): Promise<[User, string]> {
  if (!searchParams.code) {
    throw stringifyError({ message: 'Missing `code` in search params', status: 400 });
  }

  const [authorizationCode] = await db
    .select()
    .from(authorizationCodes)
    .where(eq(authorizationCodes.code, searchParams.code));

  if (!authorizationCode) {
    throw stringifyError({ message: 'Missing and/or expired authorization code.', status: 404 });
  }

  // FIXME: Account for instances where db and server are hosted in different locations
  // or else this condition might fail.
  if (authorizationCode.expiresAt.getTime() < Date.now()) {
    throw stringifyError({ message: 'Expired authorization code.', status: 400 });
  }

  if (authorizationCode.redirectUrl !== searchParams.redirect_url) {
    throw stringifyError({ message: 'Invalid redirect url.', status: 400 });
  }

  if (authorizationCode.clientId !== searchParams.client_id) {
    throw stringifyError({
      message: `Invalid client id ${searchParams.client_id}.`,
      status: 400,
    });
  }

  const user = await db.query.users.findFirst({
    where: eq(users.id, authorizationCode.userId),
    with: { usersToLabels: { with: { label: true, user: true } } },
  });

  if (!user) {
    throw stringifyError({ message: 'Unable to locate user.', status: 404 });
  }

  await db.delete(authorizationCodes).where(eq(authorizationCodes.id, authorizationCode.id));

  return [user, authorizationCode.scope];
}

async function getUserAndScopeForRefreshToken({
  searchParams,
}: {
  searchParams: z.infer<typeof searchParamsSchema>;
}): Promise<[User, string]> {
  if (!searchParams.refresh_token) {
    throw stringifyError({ message: 'Missing `refresh_token` in search params', status: 400 });
  }

  // Check for 'replay attacks'. In the case where 'this' token is a descendant of a newer one,
  // we can conclude a rotation has already taken place, therefore this request is consider malicious
  // and we should delete all related refresh tokens.
  const descendants = await db
    .select()
    .from(refreshTokens)
    .where(eq(refreshTokens.descendantKey, searchParams.refresh_token));

  if (descendants.length > 0) {
    await db
      .delete(refreshTokens)
      .where(eq(refreshTokens.descendantKey, searchParams.refresh_token));
    throw stringifyError({ message: 'Be a good boy!', status: 400 });
  }

  const [rtk] = await db
    .select()
    .from(refreshTokens)
    .where(eq(refreshTokens.key, searchParams.refresh_token));

  if (!rtk) {
    throw stringifyError({ message: 'Unable to locate refresh token', status: 400 });
  }

  const userId = (jwt.verify(rtk.token, searchParams.client_secret) as JwtPayload)?.sub;
  if (!(userId && !isNaN(parseInt(userId)))) {
    throw stringifyError({ message: 'Missing and/or invalid `sub` in refresh token', status: 400 });
  }

  const scope =
    (jwt.decode(rtk.token, { json: true }) as (JwtPayload & { scope: string }) | null)?.scope ?? '';

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, parseInt(userId)));

  if (!user) {
    throw stringifyError({ message: 'Unable to locate user.', status: 404 });
  }

  return [user, scope];
}
