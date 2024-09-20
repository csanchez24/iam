import { db } from '@/server/db';
import { permissions } from '@/server/db/schema';
import { genTsRestErrorRes } from '@/server/utils/gen-ts-rest-error';
import { createPaginator } from '@/server/utils/paginate';
import { tsr } from '@ts-rest/serverless/next';
import { eq, sql } from 'drizzle-orm';
import { contract } from '../contracts';
import { parseDrizzleFindManyQuery, parseDrizzleFindUniqueQuery } from './_utils';

const paginate = createPaginator();

export const permission = tsr.router(contract.permission, {
  // --------------------------------------
  // GET - /permissions
  // --------------------------------------
  findMany: async ({ query }) => {
    try {
      const q = parseDrizzleFindManyQuery(permissions)(query);

      const body = await paginate({
        page: query.page,
        limit: query.limit,
        $transaction: ({ limit, offset }) =>
          db.transaction(async (tx) => {
            const a = await tx.query.permissions.findMany({ ...q, limit, offset });
            const c = await tx.select({ count: sql<number>`count(*)` }).from(permissions).where(q.where) // prettier-ignore
            return [a, c[0]!.count];
          }),
      });

      return { status: 200, body };
    } catch (e) {
      return genTsRestErrorRes(e, {
        genericMsg: 'Something went wrong querying permissions.',
      });
    }
  },
  // --------------------------------------
  // GET - /permissions/{id}
  // --------------------------------------
  findUnique: async ({ params: { id }, query }) => {
    try {
      const permission = await db.query.permissions.findFirst({
        where: eq(permissions.id, id),
        with: parseDrizzleFindUniqueQuery(permissions)(query).with,
      });

      if (!permission) {
        return { status: 404, body: { message: `Unable to locate permission with id (${id})` } };
      }

      return { status: 200, body: permission };
    } catch (e) {
      return genTsRestErrorRes(e, {
        genericMsg: `Something went wrong getting permission with id (${id}).`,
      });
    }
  },
  // --------------------------------------
  // POST - /permissions
  // --------------------------------------
  create: async ({ body: { data } }) => {
    try {
      const newPermission = await db.transaction(async (tx) => {
        const [{ insertId }] = await tx.insert(permissions).values(data);

        return (await tx.select().from(permissions).where(eq(permissions.id, insertId))).at(0);
      });

      if (!newPermission) {
        return { status: 400, body: { message: 'Failed to create permission.' } };
      }

      return { status: 201, body: newPermission };
    } catch (e) {
      return genTsRestErrorRes(e, {
        genericMsg: `Something went wrong creating permission.`,
      });
    }
  },
  // --------------------------------------
  // PUT - /permissions/{id}
  // --------------------------------------
  update: async ({ params: { id }, body: { data } }) => {
    try {
      const updatedPermission = await db.transaction(async (tx) => {
        await tx.update(permissions).set(data).where(eq(permissions.id, id));
        return (await tx.select().from(permissions).where(eq(permissions.id, id))).at(0);
      });

      if (!updatedPermission) {
        return { status: 400, body: { message: 'Failed to update permission.' } };
      }

      return { status: 200, body: updatedPermission };
    } catch (e) {
      return genTsRestErrorRes(e, {
        genericMsg: `Something went wrong updating permission.`,
      });
    }
  },
  // --------------------------------------
  // DELETE - /permissions/{id}
  // --------------------------------------
  delete: async ({ params: { id } }) => {
    try {
      const [permission] = await db.select().from(permissions).where(eq(permissions.id, id));
      if (!permission) {
        return { status: 404, body: { message: `Unable to locate permission with id (${id})` } };
      }

      await db.delete(permissions).where(eq(permissions.id, id));
      return { status: 200, body: permission };
    } catch (e) {
      return genTsRestErrorRes(e, { genericMsg: `Something went wrong deleting permission.` });
    }
  },
});
