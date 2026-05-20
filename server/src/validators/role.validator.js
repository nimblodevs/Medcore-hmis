import { z } from "zod";

export const createRoleSchema = z.object({
  tenantId: z.string().uuid().optional(),
  name: z.string().min(2),
  code: z.string().min(2),
  description: z.string().optional(),
  permissionIds: z.array(z.string().uuid()).optional()
});

