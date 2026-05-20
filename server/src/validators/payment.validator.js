import { z } from "zod";

export const createPaymentSchema = z.object({
  tenantId: z.string().uuid().optional(),
  branchId: z.string().uuid(),
  patientId: z.string().uuid().optional(),
  paymentDate: z.coerce.date(),
  paymentMethod: z.enum(["CASH", "BANK_TRANSFER", "CHEQUE", "MOBILE_MONEY", "CARD"]),
  referenceNo: z.string().optional(),
  amountReceived: z.coerce.number().positive(),
  notes: z.string().optional()
});

export const allocatePaymentSchema = z.object({
  invoiceId: z.string().uuid(),
  allocatedAmount: z.coerce.number().positive()
});

export const createReceiptSchema = z.object({
  paymentId: z.string().uuid(),
  invoiceId: z.string().uuid().optional(),
  paymentAllocationId: z.string().uuid().optional(),
  amount: z.coerce.number().positive(),
  receiptDate: z.coerce.date()
});

