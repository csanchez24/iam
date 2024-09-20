import { RoleCreateBodySchema } from '@/schemas/role';
import { z } from 'zod';

export const RoleFormSchema = RoleCreateBodySchema.shape.data.extend({
  applicationId: z.coerce.number().optional(),
});
