import { db } from '@/server/db';
import { labels } from '@/server/db/schema';
import { genTsRestErrorRes } from '@/server/utils/gen-ts-rest-error';
import { createPaginator } from '@/server/utils/paginate';
import { tsr } from '@ts-rest/serverless/next';
import { eq, sql } from 'drizzle-orm';
import { contract } from '../contracts';
import { parseDrizzleFindManyQuery, parseDrizzleFindUniqueQuery } from './_utils';

const paginate = createPaginator();

export const label = tsr.router(contract.label, {
  // --------------------------------------
  // GET - /labels
  // --------------------------------------
  findMany: async ({ query }) => {
    try {
      const q = parseDrizzleFindManyQuery(labels)(query);

      const body = await paginate({
        page: query.page,
        limit: query.limit,
        $transaction: ({ limit, offset }) =>
          db.transaction(async (tx) => {
            const a = await tx.query.labels.findMany({ ...q, limit, offset });
            const c = await tx.select({ count: sql<number>`count(*)` }).from(labels).where(q.where) // prettier-ignore
            return [a, c[0]!.count];
          }),
      });

      return { status: 200, body };
    } catch (e) {
      return genTsRestErrorRes(e, {
        genericMsg: 'Something went wrong querying labels.',
      });
    }
  },
  // --------------------------------------
  // GET - /labels/{id}
  // --------------------------------------
  findUnique: async ({ params: { id }, query }) => {
    try {
      const label = await db.query.labels.findFirst({
        where: eq(labels.id, id),
        with: parseDrizzleFindUniqueQuery(labels)(query).with,
      });

      if (!label) {
        return { status: 404, body: { message: `Unable to locate label with id (${id})` } };
      }

      return { status: 200, body: label };
    } catch (e) {
      return genTsRestErrorRes(e, {
        genericMsg: `Something went wrong getting label with id (${id}).`,
      });
    }
  },
  // --------------------------------------
  // POST - /labels
  // --------------------------------------
  create: async ({ body: { data } }) => {
    try {
      const [{ insertId }] = await db.insert(labels).values(data);

      const [newLabel] = await db.select().from(labels).where(eq(labels.id, insertId));

      if (!newLabel) {
        return { status: 400, body: { message: 'Failed to create label.' } };
      }

      return { status: 201, body: newLabel };
    } catch (e) {
      return genTsRestErrorRes(e, {
        genericMsg: `Something went wrong creating label.`,
      });
    }
  },
  // --------------------------------------
  // PUT - /labels/{id}
  // --------------------------------------
  update: async ({ params: { id }, body: { data } }) => {
    try {
      await db.update(labels).set(data).where(eq(labels.id, id));

      const [updatedLabel] = await db.select().from(labels).where(eq(labels.id, id));

      if (!updatedLabel) {
        return { status: 400, body: { message: 'Failed to update label.' } };
      }

      return { status: 200, body: updatedLabel };
    } catch (e) {
      return genTsRestErrorRes(e, {
        genericMsg: `Something went wrong updating label.`,
      });
    }
  },
  // --------------------------------------
  // DELETE - /labels/{id}
  // --------------------------------------
  delete: async ({ params: { id } }) => {
    try {
      const [label] = await db.select().from(labels).where(eq(labels.id, id));
      if (!label) {
        return { status: 404, body: { message: `Unable to locate label with id (${id})` } };
      }

      await db.delete(labels).where(eq(labels.id, id));
      return { status: 200, body: label };
    } catch (e) {
      return genTsRestErrorRes(e, { genericMsg: `Something went wrong deleting label.` });
    }
  },
});
