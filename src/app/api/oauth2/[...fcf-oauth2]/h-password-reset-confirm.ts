import type { NextRequest } from 'next/server';

import { AuthPasswordResetConfirmBodySchema } from '@/schemas/auth';

import { parseError, stringifyError } from '@/auth/utils/error-response';
import { parseSearchParams } from '@/auth/utils/parse-search-params';
import { db } from '@/server/db';
import { passwordResetRequests, users } from '@/server/db/schema';
import { hashPassord } from '@/server/utils/password';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const searchParamsSchema = z.object({
  pass_reset_pid: z.string().uuid(),
});

/**
 * --------------------------------------------------------------------------------------------
 * POST - /api/oauth2/password-reset-confirm?pass_reset_pid=<string>
 *
 * This endpoint confirms the password reset and returns back to the client the
 * authorization request public id in the payload so that the client/front-end
 * can redirect back to the /login page where the user can authenticate with the
 * new credentials.
 * --------------------------------------------------------------------------------------------
 */
export async function POSTPasswordResetConfirm(req: NextRequest) {
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

    const [passwordResetRequest] = await db
      .select()
      .from(passwordResetRequests)
      .where(eq(passwordResetRequests.pid, parsedSearchParams.data.pass_reset_pid));

    if (!passwordResetRequest) {
      throw stringifyError({
        message: 'Invalid and/or expired password reset request.',
        status: 400,
      });
    }

    const { password, passwordConfirmation } = (await req.json()) as z.infer<
      typeof AuthPasswordResetConfirmBodySchema
    >;

    const parsed = AuthPasswordResetConfirmBodySchema.safeParse({ password, passwordConfirmation });
    if (!parsed.success) {
      throw stringifyError({
        message:
          parsed.error.flatten().formErrors.at(0) ?? 'Something went wrong parsing body payload.',
        status: 400,
      });
    }

    if (password !== passwordConfirmation) {
      throw stringifyError({
        message: 'Password do not match. Check and try again!',
        status: 400,
      });
    }

    await db.transaction(async (tx) => {
      const passwordHash = await hashPassord(password);
      await tx
        .update(users)
        .set({ password: passwordHash })
        .where(eq(users.id, passwordResetRequest.userId));

      // Now we can delete that password reset entry from db
      return await tx
        .delete(passwordResetRequests)
        .where(eq(passwordResetRequests.id, passwordResetRequest.id));
    });

    return Response.json({ authReqPid: passwordResetRequest.authReqPid });
  } catch (e) {
    return Response.json(...parseError(e));
  }
}
