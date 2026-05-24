import { z } from "zod";

export const createDebtorSchemeSchema = z.object({
  debtorAccountId: z.string().uuid(),
  schemeCode: z.string().min(2).max(50),
  schemeName: z.string().min(2).max(200),
  schemeType: z.enum([
    "OUTPATIENT",
    "INPATIENT",
    "COMPREHENSIVE",
    "MATERNITY",
    "DENTAL",
    "OPTICAL",
    "CHRONIC_CARE",
    "EMERGENCY",
    "CUSTOM"
  ]),
  description: z.string().max(1000).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  creditLimit: z.coerce.number().min(0).optional(),
  paymentTermsDays: z.coerce.number().int().min(0).max(365).optional(),
  requiresPreAuthorization: z.boolean().default(false),
  allowsOutpatientBilling: z.boolean().default(true),
  allowsInpatientBilling: z.boolean().default(true),
  allowsPharmacyBilling: z.boolean().default(true),
  allowsLabBilling: z.boolean().default(true),
  allowsRadiologyBilling: z.boolean().default(true),
  notes: z.string().max(2000).optional()
});

export const updateDebtorSchemeSchema = createDebtorSchemeSchema.partial();

export const createSchemeDepartmentRuleSchema = z.object({
  departmentId: z.string().uuid(),
  isAllowed: z.boolean().default(true),
  requiresAuthorization: z.boolean().default(false),
  allowsCashTopup: z.boolean().default(true),
  overLimitAction: z.enum([
    "BLOCK_SERVICE",
    "ALLOW_CASH_TOPUP",
    "REQUIRE_OVERRIDE",
    "ALLOW_WITH_APPROVAL"
  ]).default("ALLOW_CASH_TOPUP"),
  notes: z.string().max(1000).optional(),
  effectiveFrom: z.coerce.date().optional(),
  effectiveTo: z.coerce.date().optional()
});

export const updateSchemeDepartmentRuleSchema = createSchemeDepartmentRuleSchema.partial();

export const createSchemeServicePointRuleSchema = z.object({
  departmentId: z.string().uuid().optional(),
  servicePointId: z.string().uuid().optional(),
  serviceCategory: z.enum([
    "CONSULTATION",
    "PHARMACY",
    "LABORATORY",
    "RADIOLOGY",
    "DENTAL",
    "OPTICAL",
    "PHYSIOTHERAPY",
    "PROCEDURE",
    "MATERNITY",
    "EMERGENCY",
    "INPATIENT",
    "THEATRE",
    "OTHER"
  ]),
  isAllowed: z.boolean().default(true),
  requiresAuthorization: z.boolean().default(false),
  allowsCashTopup: z.boolean().default(true),
  overLimitAction: z.enum([
    "BLOCK_SERVICE",
    "ALLOW_CASH_TOPUP",
    "REQUIRE_OVERRIDE",
    "ALLOW_WITH_APPROVAL"
  ]).default("ALLOW_CASH_TOPUP"),
  notes: z.string().max(1000).optional(),
  effectiveFrom: z.coerce.date().optional(),
  effectiveTo: z.coerce.date().optional()
});

export const updateSchemeServicePointRuleSchema = createSchemeServicePointRuleSchema.partial();

export const createSchemeOutpatientLimitSchema = z.object({
  departmentId: z.string().uuid().optional(),
  servicePointId: z.string().uuid().optional(),
  serviceCategory: z.enum([
    "CONSULTATION",
    "PHARMACY",
    "LABORATORY",
    "RADIOLOGY",
    "DENTAL",
    "OPTICAL",
    "PHYSIOTHERAPY",
    "PROCEDURE",
    "MATERNITY",
    "EMERGENCY",
    "INPATIENT",
    "THEATRE",
    "OTHER"
  ]).optional(),
  limitType: z.enum([
    "PER_VISIT",
    "PER_DAY",
    "PER_MONTH",
    "PER_YEAR",
    "LIFETIME"
  ]),
  limitAmount: z.coerce.number().positive(),
  overLimitAction: z.enum([
    "BLOCK_SERVICE",
    "ALLOW_CASH_TOPUP",
    "REQUIRE_OVERRIDE",
    "ALLOW_WITH_APPROVAL"
  ]).default("ALLOW_CASH_TOPUP"),
  requiresAuthorization: z.boolean().default(false),
  allowsCashTopup: z.boolean().default(true),
  effectiveFrom: z.coerce.date().optional(),
  effectiveTo: z.coerce.date().optional()
});

export const updateSchemeOutpatientLimitSchema = createSchemeOutpatientLimitSchema.partial();

export const createSchemeVisitLimitSchema = z.object({
  departmentId: z.string().uuid().optional(),
  visitType: z.string().optional(),
  visitLimitAmount: z.coerce.number().positive(),
  overLimitAction: z.enum([
    "BLOCK_SERVICE",
    "ALLOW_CASH_TOPUP",
    "REQUIRE_OVERRIDE",
    "ALLOW_WITH_APPROVAL"
  ]).default("ALLOW_CASH_TOPUP"),
  effectiveFrom: z.coerce.date().optional(),
  effectiveTo: z.coerce.date().optional()
});

export const updateSchemeVisitLimitSchema = createSchemeVisitLimitSchema.partial();

export const createSchemeCopaymentCategorySchema = z.object({
  code: z.string().min(2).max(50),
  name: z.string().min(2).max(200),
  serviceCategory: z.enum([
    "CONSULTATION",
    "PHARMACY",
    "LABORATORY",
    "RADIOLOGY",
    "DENTAL",
    "OPTICAL",
    "PHYSIOTHERAPY",
    "PROCEDURE",
    "MATERNITY",
    "EMERGENCY",
    "INPATIENT",
    "THEATRE",
    "OTHER"
  ]),
  description: z.string().max(1000).optional()
});

export const updateSchemeCopaymentCategorySchema = createSchemeCopaymentCategorySchema.partial();

export const createSchemeCopaymentRuleSchema = z.object({
  copaymentCategoryId: z.string().uuid().optional(),
  departmentId: z.string().uuid().optional(),
  servicePointId: z.string().uuid().optional(),
  serviceCategory: z.enum([
    "CONSULTATION",
    "PHARMACY",
    "LABORATORY",
    "RADIOLOGY",
    "DENTAL",
    "OPTICAL",
    "PHYSIOTHERAPY",
    "PROCEDURE",
    "MATERNITY",
    "EMERGENCY",
    "INPATIENT",
    "THEATRE",
    "OTHER"
  ]).optional(),
  copaymentType: z.enum([
    "NONE",
    "FIXED_AMOUNT",
    "PERCENTAGE",
    "CONSULTATION_ONLY",
    "SERVICE_POINT_BASED"
  ]),
  percentageValue: z.coerce.number().min(0).max(100).optional(),
  fixedAmount: z.coerce.number().min(0).optional(),
  minimumAmount: z.coerce.number().min(0).optional(),
  maximumAmount: z.coerce.number().min(0).optional(),
  appliesToConsultation: z.boolean().default(false),
  effectiveFrom: z.coerce.date().optional(),
  effectiveTo: z.coerce.date().optional()
});

export const updateSchemeCopaymentRuleSchema = createSchemeCopaymentRuleSchema.partial();

export const createSchemeAuthorizationRuleSchema = z.object({
  departmentId: z.string().uuid().optional(),
  servicePointId: z.string().uuid().optional(),
  serviceCategory: z.enum([
    "CONSULTATION",
    "PHARMACY",
    "LABORATORY",
    "RADIOLOGY",
    "DENTAL",
    "OPTICAL",
    "PHYSIOTHERAPY",
    "PROCEDURE",
    "MATERNITY",
    "EMERGENCY",
    "INPATIENT",
    "THEATRE",
    "OTHER"
  ]).optional(),
  requiresAuthorization: z.boolean().default(true),
  thresholdAmount: z.coerce.number().min(0).optional(),
  notes: z.string().max(1000).optional(),
  effectiveFrom: z.coerce.date().optional(),
  effectiveTo: z.coerce.date().optional()
});

export const updateSchemeAuthorizationRuleSchema = createSchemeAuthorizationRuleSchema.partial();

export const validateEligibilitySchema = z.object({
  patientId: z.string().uuid(),
  visitId: z.string().uuid(),
  departmentId: z.string().uuid(),
  servicePointId: z.string().uuid().optional(),
  serviceCategory: z.enum([
    "CONSULTATION",
    "PHARMACY",
    "LABORATORY",
    "RADIOLOGY",
    "DENTAL",
    "OPTICAL",
    "PHYSIOTHERAPY",
    "PROCEDURE",
    "MATERNITY",
    "EMERGENCY",
    "INPATIENT",
    "THEATRE",
    "OTHER"
  ]),
  amount: z.coerce.number().positive()
});
