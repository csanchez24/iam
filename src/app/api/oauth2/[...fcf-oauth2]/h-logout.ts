import type { NextRequest } from 'next/server';

import { parseError, stringifyError } from '@/auth/utils/error-response';
import { parseSearchParams } from '@/auth/utils/parse-search-params';
import { db } from '@/server/db';
import { refreshTokens } from '@/server/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const searchParamsSchema = z.object({
  post_logout_redirect_url: z.coerce.boolean().optional(),
});

const bodySchema = z.object({
  refreshToken: z.string().uuid(),
});

/**
 * --------------------------------------------------------------------------------------------
 * POST - /api/oauth2/logout?post_logout_redirect_url=[url]
 *
 * This route is responsible for validating search parameters and creating code we'll use
 * later on in the process to exchange for token.
 * --------------------------------------------------------------------------------------------
 */
export async function POSTLogout(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;

    const parsedSearchParams = parseSearchParams(searchParams, searchParamsSchema);

    if (!parsedSearchParams.success) {
      throw stringifyError({
        message:
          Object.values(parsedSearchParams.error.flatten().fieldErrors).at(0)?.at(0) ??
          'Something went wrong parsing serch parameters.',
        status: 400,
      });
    }

    const { refreshToken } = (await req.json()) as z.infer<typeof bodySchema>;

    const parsed = bodySchema.safeParse({ refreshToken });
    if (!parsed.success) {
      throw stringifyError({
        message:
          parsed.error.flatten().formErrors.at(0) ?? 'Something went wrong parsing body payload.',
        status: 400,
      });
    }

    await db.delete(refreshTokens).where(eq(refreshTokens.key, parsed.data.refreshToken));

    return Response.json({ success: true });
  } catch (e) {
    return Response.json(...parseError(e));
  }
}
