import { z } from "zod";

const createDepartmentSchema = z.object({
  tenantId: z.string().uuid().optional(),
  branchId: z.string().uuid().optional(),
  name: z.string().min(2),
  code: z.string().min(2),
  description: z.string().optional(),
  isClinical: z.boolean().optional(),
  isActive: z.boolean().optional()
});

const updateDepartmentSchema = z.object({
  branchId: z.string().uuid().optional(),
  name: z.string().min(2).optional(),
  code: z.string().min(2).optional(),
  description: z.string().optional(),
  isClinical: z.boolean().optional(),
  isActive: z.boolean().optional()
});

export { createDepartmentSchema, updateDepartmentSchema };

