import { z } from "zod";

export const createBillSchema = z.object({
  patientId: z.string().uuid(),
  patientVisitId: z.string().uuid().optional(),

  payerType: z.enum([
    "CASH",
    "INSURANCE",
    "CORPORATE",
    "DIRECT_CORPORATE",
    "SHA",
    "PATIENT_CREDIT"
  ]),

  debtorAccountId: z.string().uuid().optional(),
  debtorSchemeId: z.string().uuid().optional(),
  patientPayerProfileId: z.string().uuid().optional(),

  notes: z.string().max(1000).optional()
});

export const updateBillSchema = createBillSchema.partial();

export const createBillItemSchema = z.object({
  sourceType: z.enum([
    "MANUAL",
    "CONSULTATION",
    "EMR_ORDER",
    "PHARMACY",
    "LABORATORY",
    "RADIOLOGY",
    "PROCEDURE",
    "INPATIENT",
    "THEATRE",
    "OTHER"
  ]),

  sourceRecordId: z.string().uuid().optional(),

  departmentId: z.string().uuid().optional(),
  servicePointId: z.string().uuid().optional(),

  serviceCategory: z.string().max(80).optional(),
  serviceCode: z.string().max(80).optional(),
  description: z.string().min(2).max(300),

  quantity: z.coerce.number().positive(),
  unitPrice: z.coerce.number().min(0),

  authorizationNumber: z.string().max(100).optional()
});

export const updateBillItemSchema = createBillItemSchema.partial();

export const billingAdjustmentSchema = z.object({
  amount: z.coerce.number().positive(),
  reason: z.string().min(3).max(1000)
});

export const linkCashPaymentSchema = z.object({
  cashPaymentId: z.string().uuid().optional(),
  cashSessionId: z.string().uuid().optional(),
  amount: z.coerce.number().positive()
});

export const validateCreditSchema = z.object({
  debtorAccountId: z.string().uuid(),
  debtorSchemeId: z.string().uuid()
});

export const postToCreditSchema = z.object({
  invoiceId: z.string().uuid().optional()
});

export const reverseBillItemSchema = z.object({
  reason: z.string().min(3).max(1000)
});

export const cancelBillSchema = z.object({
  reason: z.string().min(3).max(1000)
});
