import type { NextRequest } from 'next/server';

import { parseError, stringifyError } from '@/auth/utils/error-response';
import { parseSearchParams } from '@/auth/utils/parse-search-params';
import { db } from '@/server/db';
import { passwordResetRequests } from '@/server/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const searchParamsSchema = z.object({
  pass_reset_pid: z.string().uuid(),
});

const bodySchema = z.object({
  code: z.string().min(6),
});

/**
 * --------------------------------------------------------------------------------------------
 * POST - /api/oauth2/password-reset-code?pass_reset_pid=<string>
 *
 * This route expects two values, the `pass_reset_pid` in the search parameters and the
 * code sent to the user via email in the body of the request. With the public id
 * we can retrieve the entry from `password_resets` table and validate the code.
 * --------------------------------------------------------------------------------------------
 */
export async function POSTPasswordResetCode(req: NextRequest) {
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

    const { code } = (await req.json()) as z.infer<typeof bodySchema>;

    const parsed = bodySchema.safeParse({ code });
    if (!parsed.success) {
      throw stringifyError({
        message:
          parsed.error.flatten().formErrors.at(0) ?? 'Something went wrong parsing body payload.',
        status: 400,
      });
    }

    // Retrieve password reset entry and validate code
    const [passwordResetRequest] = await db
      .select()
      .from(passwordResetRequests)
      .where(eq(passwordResetRequests.pid, parsedSearchParams.data.pass_reset_pid));
    if (!passwordResetRequest || passwordResetRequest.code !== parsed.data.code) {
      throw stringifyError({
        message: 'Invalid and/or wrong code.',
        status: 400,
      });
    }

    return Response.json({ success: true });
  } catch (e) {
    return Response.json(...parseError(e));
  }
}
