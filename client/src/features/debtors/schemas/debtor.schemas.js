import { z } from "zod";

export const debtorTypeOptions = [
  { value: "INSURANCE", label: "Insurance" },
  { value: "CORPORATE", label: "Corporate" },
  { value: "DIRECT_CORPORATE", label: "Direct Corporate" },
  { value: "SHA", label: "SHA" },
  { value: "NGO", label: "NGO" },
  { value: "EMBASSY", label: "Embassy" },
  { value: "GOVERNMENT", label: "Government" },
  { value: "OTHER", label: "Other" }
];

export const debtorStatusOptions = [
  { value: "DRAFT", label: "Draft" },
  { value: "ACTIVE", label: "Active" },
  { value: "ON_HOLD", label: "On Hold" },
  { value: "SUSPENDED", label: "Suspended" },
  { value: "CLOSED", label: "Closed" },
  { value: "ARCHIVED", label: "Archived" }
];

export const billingCycleOptions = [
  { value: "DAILY", label: "Daily" },
  { value: "WEEKLY", label: "Weekly" },
  { value: "BIWEEKLY", label: "Bi-weekly" },
  { value: "MONTHLY", label: "Monthly" },
  { value: "CUSTOM", label: "Custom" }
];

export const contactTypeOptions = [
  { value: "BILLING", label: "Billing" },
  { value: "CLAIMS", label: "Claims" },
  { value: "FINANCE", label: "Finance" },
  { value: "AUTHORIZATION", label: "Authorization" },
  { value: "GENERAL", label: "General" }
];

export const createDebtorAccountSchema = z.object({
  debtorName: z.string().min(2, "Debtor name must be at least 2 characters").max(200, "Debtor name is too long"),
  debtorType: z.enum(["INSURANCE", "CORPORATE", "DIRECT_CORPORATE", "SHA", "NGO", "EMBASSY", "GOVERNMENT", "OTHER"]),
  legalName: z.string().max(240).optional(),
  taxPin: z.string().max(50).optional(),
  registrationNumber: z.string().max(80).optional(),
  email: z.string().email("Invalid email format").optional().or(z.literal("")),
  phone: z.string().max(30).optional(),
  website: z.string().url("Invalid URL format").optional().or(z.literal("")),
  physicalAddress: z.string().max(300).optional(),
  postalAddress: z.string().max(300).optional(),
  city: z.string().max(100).optional(),
  country: z.string().max(100).default("Kenya"),
  creditLimit: z.coerce.number().min(0, "Credit limit cannot be negative").default(0),
  paymentTermsDays: z.coerce.number().int().min(0).max(365).default(30),
  billingCycle: z.enum(["DAILY", "WEEKLY", "BIWEEKLY", "MONTHLY", "CUSTOM"]).default("MONTHLY"),
  requiresPreAuthorization: z.boolean().default(false),
  allowsOutpatientBilling: z.boolean().default(true),
  allowsInpatientBilling: z.boolean().default(true),
  allowsPharmacyBilling: z.boolean().default(true),
  allowsLabBilling: z.boolean().default(true),
  allowsRadiologyBilling: z.boolean().default(true),
  accountManagerId: z.string().uuid().optional(),
  claimsOfficerId: z.string().uuid().optional(),
  notes: z.string().max(2000).optional()
});

export const updateDebtorAccountSchema = createDebtorAccountSchema.partial();

export const createDebtorContactSchema = z.object({
  contactType: z.enum(["BILLING", "CLAIMS", "FINANCE", "AUTHORIZATION", "GENERAL"]).default("GENERAL"),
  fullName: z.string().min(2, "Full name is required").max(160),
  jobTitle: z.string().max(120).optional(),
  phone: z.string().max(30).optional(),
  email: z.string().email("Invalid email format").optional().or(z.literal("")),
  isPrimary: z.boolean().default(false),
  notes: z.string().max(1000).optional()
});

export const createDebtorContractSchema = z.object({
  contractNumber: z.string().max(100).optional(),
  contractName: z.string().min(2, "Contract name is required").max(200),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional(),
  billingCycle: z.enum(["DAILY", "WEEKLY", "BIWEEKLY", "MONTHLY", "CUSTOM"]).default("MONTHLY"),
  paymentTermsDays: z.coerce.number().int().min(0).max(365).default(30),
  creditLimit: z.coerce.number().min(0).optional(),
  requiresPreAuthorization: z.boolean().default(false),
  outpatientAllowed: z.boolean().default(true),
  inpatientAllowed: z.boolean().default(true),
  pharmacyAllowed: z.boolean().default(true),
  laboratoryAllowed: z.boolean().default(true),
  radiologyAllowed: z.boolean().default(true),
  notes: z.string().max(2000).optional()
});

export default {
  debtorTypeOptions,
  debtorStatusOptions,
  billingCycleOptions,
  contactTypeOptions,
  createDebtorAccountSchema,
  updateDebtorAccountSchema,
  createDebtorContactSchema,
  createDebtorContractSchema
};
