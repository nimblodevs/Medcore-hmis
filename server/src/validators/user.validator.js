import { z } from "zod";

const createUserSchema = z.object({
  firstName: z.string().min(2),
  middleName: z.string().optional(),
  lastName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  staffId: z.string().optional(),
  jobTitle: z.string().optional(),
  gender: z.string().optional(),
  dateOfBirth: z.coerce.date().optional(),
  address: z.string().optional(),
  primaryDepartmentId: z.string().uuid().optional(),
  password: z.string().min(8),
  tenantId: z.string().uuid().optional()
});

const updateUserSchema = z.object({
  firstName: z.string().min(2).optional(),
  middleName: z.string().optional(),
  lastName: z.string().min(2).optional(),
  phone: z.string().optional(),
  staffId: z.string().optional(),
  jobTitle: z.string().optional(),
  gender: z.string().optional(),
  dateOfBirth: z.coerce.date().optional(),
  address: z.string().optional(),
  primaryDepartmentId: z.string().uuid().optional(),
  isActive: z.boolean().optional()
});

const assignRolesSchema = z.object({
  roleIds: z.array(z.string().uuid()).min(1)
});

const assignBranchesSchema = z.object({
  branchIds: z.array(z.string().uuid()).min(1)
});

const assignDepartmentsSchema = z.object({
  departmentIds: z.array(z.string().uuid()).min(1),
  primaryDepartmentId: z.string().uuid().optional()
});

export {
  createUserSchema,
  updateUserSchema,
  assignRolesSchema,
  assignBranchesSchema,
  assignDepartmentsSchema
};
