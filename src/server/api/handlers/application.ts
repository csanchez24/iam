import { db } from '@/server/db';
import { applications, permissions } from '@/server/db/schema';
import { genTsRestErrorRes } from '@/server/utils/gen-ts-rest-error';
import { createPaginator } from '@/server/utils/paginate';
import { tsr } from '@ts-rest/serverless/next';
import { eq, sql } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { contract } from '../contracts';
import { parseDrizzleFindManyQuery, parseDrizzleFindUniqueQuery } from './_utils';

const paginate = createPaginator();

export const application = tsr.router(contract.application, {
  // --------------------------------------
  // GET - /applications
  // --------------------------------------
  findMany: async ({ query }) => {
    try {
      const q = parseDrizzleFindManyQuery(applications)(query);

      const body = await paginate({
        page: query.page,
        limit: query.limit,
        $transaction: ({ limit, offset }) =>
          db.transaction(async (tx) => {
            const a = await tx.query.applications.findMany({ ...q, limit, offset });
            const c = await tx.select({ count: sql<number>`count(*)` }).from(applications).where(q.where) // prettier-ignore
            return [a, c[0]!.count];
          }),
      });

      return { status: 200, body };
    } catch (e) {
      return genTsRestErrorRes(e, {
        genericMsg: 'Something went wrong querying applications.',
      });
    }
  },
  // --------------------------------------
  // GET - /applications/{id}
  // --------------------------------------
  findUnique: async ({ params: { id }, query }) => {
    try {
      const application = await db.query.applications.findFirst({
        where: eq(applications.id, id),
        with: parseDrizzleFindUniqueQuery(applications)(query).with,
      });

      if (!application) {
        return {
          status: 404,
          body: { message: `Unable to locate application with id (${id})` },
        };
      }

      return { status: 200, body: application };
    } catch (e) {
      return genTsRestErrorRes(e, {
        genericMsg: `Something went wrong getting application with id (${id}).`,
      });
    }
  },
  // --------------------------------------
  // POST - /applications
  // --------------------------------------
  create: async ({ body: { data } }) => {
    try {
      const newApplication = await db.transaction(async (tx) => {
        const { permissions: ps, ...values } = data;
        const [{ insertId: applicationId }] = await tx
          .insert(applications)
          .values({ ...values, clientId: crypto.randomUUID(), sercretId: nanoid(33) });
        if (ps && ps.length > 0) {
          await tx.insert(permissions).values(ps.map((p) => ({ ...p, applicationId })));
        }
        return (await tx.select().from(applications).where(eq(applications.id, applicationId))).at(
          0
        );
      });

      if (!newApplication) {
        return { status: 400, body: { message: 'Failed to create application.' } };
      }

      return { status: 201, body: newApplication };
    } catch (e) {
      return genTsRestErrorRes(e, {
        genericMsg: `Something went wrong creating application.`,
      });
    }
  },
  // --------------------------------------
  // PUT - /applications/{id}
  // --------------------------------------
  update: async ({ params: { id }, body: { data } }) => {
    try {
      const updatedApplication = await db.transaction(async (tx) => {
        const { permissions: ps, ...values } = data;
        await tx.update(applications).set(values).where(eq(applications.id, id));
        if (ps && ps.length > 0) {
          await tx.delete(permissions).where(eq(permissions.applicationId, id));
          await tx.insert(permissions).values(ps.map((p) => ({ ...p, applicationId: id })));
        }
        return (await tx.select().from(applications).where(eq(applications.id, id))).at(0);
      });

      if (!updatedApplication) {
        return { status: 400, body: { message: 'Failed to update application.' } };
      }

      return { status: 200, body: updatedApplication };
    } catch (e) {
      return genTsRestErrorRes(e, {
        genericMsg: `Something went wrong updating application.`,
      });
    }
  },
  // --------------------------------------
  // DELETE - /applications/{id}
  // --------------------------------------
  delete: async ({ params: { id } }) => {
    try {
      const [application] = await db.select().from(applications).where(eq(applications.id, id));
      if (!application) {
        return { status: 404, body: { message: `Unable to locate application with id (${id})` } };
      }

      await db.delete(applications).where(eq(applications.id, id));
      return { status: 200, body: application };
    } catch (e) {
      return genTsRestErrorRes(e, { genericMsg: `Something went wrong deleting application.` });
    }
  },
});
