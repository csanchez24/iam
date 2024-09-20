import { db } from '@/server/db';
import { users, usersToLabels, usersToRoles } from '@/server/db/schema';
import { genTsRestErrorRes } from '@/server/utils/gen-ts-rest-error';
import { createPaginator } from '@/server/utils/paginate';
import { hashPassord } from '@/server/utils/password';
import { tsr } from '@ts-rest/serverless/next';
import { eq, sql } from 'drizzle-orm';
import { contract } from '../contracts';
import { parseDrizzleFindManyQuery, parseDrizzleFindUniqueQuery } from './_utils';

const paginate = createPaginator();

export const user = tsr.router(contract.user, {
  // --------------------------------------
  // GET - /users
  // --------------------------------------
  findMany: async ({ query }) => {
    try {
      const q = parseDrizzleFindManyQuery(users)(query);

      const body = await paginate({
        page: query.page,
        limit: query.limit,
        $transaction: ({ limit, offset }) =>
          db.transaction(async (tx) => {
            const a = await tx.query.users.findMany({ ...q, limit, offset });
            const c = await tx.select({ count: sql<number>`count(*)` }).from(users).where(q.where) // prettier-ignore
            return [a, c[0]!.count];
          }),
      });

      return { status: 200, body };
    } catch (e) {
      return genTsRestErrorRes(e, {
        genericMsg: 'Something went wrong querying users.',
      });
    }
  },
  // --------------------------------------
  // GET - /users/{id}
  // --------------------------------------
  findUnique: async ({ params: { id }, query }) => {
    try {
      const user = await db.query.users.findFirst({
        where: eq(users.id, id),
        with: parseDrizzleFindUniqueQuery(users)(query).with,
      });

      if (!user) {
        return { status: 404, body: { message: `Unable to locate user with id (${id})` } };
      }

      return { status: 200, body: user };
    } catch (e) {
      return genTsRestErrorRes(e, {
        genericMsg: `Something went wrong getting user with id (${id}).`,
      });
    }
  },
  // --------------------------------------
  // POST - /users
  // --------------------------------------
  create: async ({ body: { data } }) => {
    try {
      const { password, roles, labels, ...values } = data;
      const passwordHash = await hashPassord(password);
      const newUser = await db.transaction(async (tx) => {
        const [{ insertId: userId }] = await tx
          .insert(users)
          .values({ ...values, password: passwordHash });
        if (roles && roles.length > 0) {
          await tx.insert(usersToRoles).values(roles.map(({ roleId }) => ({ roleId, userId })));
        }
        if (labels && labels.length > 0) {
          await tx.insert(usersToLabels).values(labels.map(({ labelId }) => ({ labelId, userId })));
        }
        return (await tx.select().from(users).where(eq(users.id, userId))).at(0);
      });

      if (!newUser) {
        return { status: 400, body: { message: 'Failed to create user.' } };
      }

      return { status: 201, body: newUser };
    } catch (e) {
      return genTsRestErrorRes(e, {
        genericMsg: `Something went wrong creating user.`,
      });
    }
  },
  // --------------------------------------
  // PUT - /users/{id}
  // --------------------------------------
  update: async ({ params: { id }, body: { data } }) => {
    try {
      const { password, roles, labels, ...values } = data;
      const passwordHash = password ? await hashPassord(password) : undefined;
      const updatedUser = await db.transaction(async (tx) => {
        await tx
          .update(users)
          .set({ ...values, password: passwordHash })
          .where(eq(users.id, id));

        if (roles && roles.length > 0) {
          await tx.delete(usersToRoles).where(eq(usersToRoles.userId, id));
          await tx.insert(usersToRoles).values(roles.map(({ roleId }) => ({ roleId, userId: id })));
        }

        await tx.delete(usersToLabels).where(eq(usersToLabels.userId, id));
        if (labels && labels.length > 0) {
          await tx
            .insert(usersToLabels)
            .values(labels.map(({ labelId }) => ({ labelId, userId: id })));
        }

        return (await tx.select().from(users).where(eq(users.id, id))).at(0);
      });

      if (!updatedUser) {
        return { status: 400, body: { message: 'Failed to update user.' } };
      }

      return { status: 200, body: updatedUser };
    } catch (e) {
      return genTsRestErrorRes(e, {
        genericMsg: `Something went wrong updating user.`,
      });
    }
  },
  // --------------------------------------
  // DELETE - /users/{id}
  // --------------------------------------
  delete: async ({ params: { id } }) => {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      if (!user) {
        return { status: 404, body: { message: `Unable to locate user with id (${id})` } };
      }

      await db.delete(users).where(eq(users.id, id));
      return { status: 200, body: user };
    } catch (e) {
      return genTsRestErrorRes(e, { genericMsg: `Something went wrong deleting user.` });
    }
  },
});
