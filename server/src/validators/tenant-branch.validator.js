import { z } from "zod";

const createTenantSchema = z.object({
  name: z.string().min(2),
  code: z.string().min(2),
  legalName: z.string().optional(),
  registrationNo: z.string().optional(),
  taxPin: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  website: z.string().url().optional(),
  contactPersonName: z.string().optional(),
  contactPersonPhone: z.string().optional(),
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),
  timezone: z.string().optional()
});

const updateTenantSchema = z.object({
  name: z.string().min(2).optional(),
  code: z.string().min(2).optional(),
  legalName: z.string().optional(),
  registrationNo: z.string().optional(),
  taxPin: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  website: z.string().url().optional(),
  contactPersonName: z.string().optional(),
  contactPersonPhone: z.string().optional(),
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),
  timezone: z.string().optional(),
  isActive: z.boolean().optional()
});

const createBranchSchema = z.object({
  tenantId: z.string().uuid().optional(),
  name: z.string().min(2),
  code: z.string().min(2),
  branchType: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  contactPersonName: z.string().optional(),
  contactPersonPhone: z.string().optional(),
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional()
});

const updateBranchSchema = z.object({
  name: z.string().min(2).optional(),
  code: z.string().min(2).optional(),
  branchType: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  contactPersonName: z.string().optional(),
  contactPersonPhone: z.string().optional(),
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),
  isActive: z.boolean().optional()
});

export {
  createTenantSchema,
  updateTenantSchema,
  createBranchSchema,
  updateBranchSchema
};
