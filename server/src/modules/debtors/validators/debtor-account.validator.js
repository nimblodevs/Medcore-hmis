import { z } from "zod";

export const debtorTypeSchema = z.enum([
  "INSURANCE",
  "CORPORATE",
  "DIRECT_CORPORATE",
  "SHA",
  "NGO",
  "EMBASSY",
  "GOVERNMENT",
  "OTHER"
]);

export const debtorAccountStatusSchema = z.enum([
  "DRAFT",
  "ACTIVE",
  "ON_HOLD",
  "SUSPENDED",
  "CLOSED",
  "ARCHIVED"
]);

export const billingCycleSchema = z.enum([
  "DAILY",
  "WEEKLY",
  "BIWEEKLY",
  "MONTHLY",
  "CUSTOM"
]);

export const createDebtorAccountSchema = z.object({
  debtorName: z.string().min(2, "Debtor name must be at least 2 characters").max(200, "Debtor name is too long"),

  debtorType: debtorTypeSchema,

  legalName: z.string().max(240, "Legal name is too long").optional(),
  taxPin: z.string().max(50, "Tax PIN is too long").optional(),
  registrationNumber: z.string().max(80, "Registration number is too long").optional(),

  email: z.string().email("Invalid email format").optional().or(z.literal("")),
  phone: z.string().max(30, "Phone number is too long").optional(),
  website: z.string().url("Invalid URL format").optional().or(z.literal("")),

  physicalAddress: z.string().max(300, "Address is too long").optional(),
  postalAddress: z.string().max(300, "Postal address is too long").optional(),
  city: z.string().max(100, "City name is too long").optional(),
  country: z.string().max(100, "Country name is too long").default("Kenya"),

  creditLimit: z.coerce.number().min(0, "Credit limit cannot be negative").default(0),
  paymentTermsDays: z.coerce.number().int().min(0).max(365).default(30),

  billingCycle: billingCycleSchema.default("MONTHLY"),

  requiresPreAuthorization: z.boolean().default(false),

  allowsOutpatientBilling: z.boolean().default(true),
  allowsInpatientBilling: z.boolean().default(true),
  allowsPharmacyBilling: z.boolean().default(true),
  allowsLabBilling: z.boolean().default(true),
  allowsRadiologyBilling: z.boolean().default(true),

  accountManagerId: z.string().uuid().optional(),
  claimsOfficerId: z.string().uuid().optional(),

  notes: z.string().max(2000, "Notes are too long").optional()
});

export const updateDebtorAccountSchema = createDebtorAccountSchema.partial();

export const activateDebtorAccountSchema = z.object({
  reason: z.string().max(500).optional()
});

export const holdDebtorAccountSchema = z.object({
  reason: z.string().min(1, "Hold reason is required").max(500)
});

export const suspendDebtorAccountSchema = z.object({
  reason: z.string().min(1, "Suspension reason is required").max(500)
});

export const closeDebtorAccountSchema = z.object({
  reason: z.string().min(1, "Closure reason is required").max(500)
});

export default {
  createDebtorAccountSchema,
  updateDebtorAccountSchema,
  activateDebtorAccountSchema,
  holdDebtorAccountSchema,
  suspendDebtorAccountSchema,
  closeDebtorAccountSchema,
  debtorTypeSchema,
  debtorAccountStatusSchema,
  billingCycleSchema
};
