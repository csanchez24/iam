import { db } from '@/server/db';
import { roles, rolesToPermissions } from '@/server/db/schema';
import { genTsRestErrorRes } from '@/server/utils/gen-ts-rest-error';
import { createPaginator } from '@/server/utils/paginate';
import { tsr } from '@ts-rest/serverless/next';
import { eq, sql } from 'drizzle-orm';
import { contract } from '../contracts';
import { parseDrizzleFindManyQuery, parseDrizzleFindUniqueQuery } from './_utils';

const paginate = createPaginator();

export const role = tsr.router(contract.role, {
  // --------------------------------------
  // GET - /roles
  // --------------------------------------
  findMany: async ({ query }) => {
    try {
      const q = parseDrizzleFindManyQuery(roles)(query);

      const body = await paginate({
        page: query.page,
        limit: query.limit,
        $transaction: ({ limit, offset }) =>
          db.transaction(async (tx) => {
            const a = await tx.query.roles.findMany({ ...q, limit, offset });
            const c = await tx.select({ count: sql<number>`count(*)` }).from(roles).where(q.where) // prettier-ignore
            return [a, c[0]!.count];
          }),
      });

      return { status: 200, body };
    } catch (e) {
      return genTsRestErrorRes(e, {
        genericMsg: 'Something went wrong querying roles.',
      });
    }
  },
  // --------------------------------------
  // GET - /roles/{id}
  // --------------------------------------
  findUnique: async ({ params: { id }, query }) => {
    try {
      const role = await db.query.roles.findFirst({
        where: eq(roles.id, id),
        with: parseDrizzleFindUniqueQuery(roles)(query).with,
      });

      if (!role) {
        return { status: 404, body: { message: `Unable to locate role with id (${id})` } };
      }

      return { status: 200, body: role };
    } catch (e) {
      return genTsRestErrorRes(e, {
        genericMsg: `Something went wrong getting role with id (${id}).`,
      });
    }
  },
  // --------------------------------------
  // POST - /roles
  // --------------------------------------
  create: async ({ body: { data } }) => {
    try {
      const newRole = await db.transaction(async (tx) => {
        const { policies, ...values } = data;
        const [{ insertId: roleId }] = await tx.insert(roles).values(values);
        if (policies && policies.length > 0) {
          await tx.insert(rolesToPermissions).values(policies.map((p) => ({ ...p, roleId })));
        }
        return (await tx.select().from(roles).where(eq(roles.id, roleId))).at(0);
      });

      if (!newRole) {
        return { status: 400, body: { message: 'Failed to create role.' } };
      }

      return { status: 201, body: newRole };
    } catch (e) {
      return genTsRestErrorRes(e, {
        genericMsg: `Something went wrong creating role.`,
      });
    }
  },
  // --------------------------------------
  // PUT - /roles/{id}
  // --------------------------------------
  update: async ({ params: { id }, body: { data } }) => {
    try {
      const updatedRole = await db.transaction(async (tx) => {
        const { policies, ...values } = data;
        await tx.update(roles).set(values).where(eq(roles.id, id));
        if (policies && policies.length > 0) {
          await tx.delete(rolesToPermissions).where(eq(rolesToPermissions.roleId, id));
          await tx.insert(rolesToPermissions).values(policies.map((p) => ({ ...p, roleId: id })));
        }
        return (await tx.select().from(roles).where(eq(roles.id, id))).at(0);
      });

      if (!updatedRole) {
        return { status: 400, body: { message: 'Failed to update role.' } };
      }

      return { status: 200, body: updatedRole };
    } catch (e) {
      return genTsRestErrorRes(e, {
        genericMsg: `Something went wrong updating role.`,
      });
    }
  },
  // --------------------------------------
  // DELETE - /roles/{id}
  // --------------------------------------
  delete: async ({ params: { id } }) => {
    try {
      const [role] = await db.select().from(roles).where(eq(roles.id, id));
      if (!role) {
        return { status: 404, body: { message: `Unable to locate role with id (${id})` } };
      }

      await db.delete(roles).where(eq(roles.id, id));
      return { status: 200, body: role };
    } catch (e) {
      return genTsRestErrorRes(e, { genericMsg: `Something went wrong deleting role.` });
    }
  },
});
