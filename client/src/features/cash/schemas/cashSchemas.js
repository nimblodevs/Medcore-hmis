import { z } from "zod";

export const cashCounterSchema = z.object({
  name: z.string().min(1, "Name is required"),
  code: z.string().min(1, "Code is required"),
  department: z.string().optional(),
  description: z.string().optional(),
  defaultCurrency: z.string().default("KES"),
  supervisorId: z.string().uuid().optional().nullable()
});

export const cashierProfileSchema = z.object({
  userId: z.string().uuid(),
  staffNumber: z.string().min(1, "Staff number is required"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().optional(),
  department: z.string().optional(),
  defaultCounterId: z.string().uuid().optional().nullable(),
  supervisorId: z.string().uuid().optional().nullable()
});

export const openCashSessionSchema = z.object({
  counterId: z.string().uuid(),
  cashierId: z.string().uuid(),
  openingFloat: z.number().min(0, "Opening float must be zero or greater"),
  currency: z.string().min(1, "Currency is required"),
  openingNotes: z.string().optional()
});

export const closeCashSessionSchema = z.object({
  actualCash: z.number().min(0, "Actual cash must be zero or greater"),
  closingNotes: z.string().optional(),
  varianceReason: z.string().optional()
});

export const recordPaymentSchema = z.object({
  sessionId: z.string().uuid(),
  paymentMethod: z.enum(["CASH", "BANK_TRANSFER", "CHEQUE", "MOBILE_MONEY", "CARD"]),
  amount: z.number().positive("Amount must be positive"),
  referenceNo: z.string().optional(),
  payerName: z.string().optional(),
  payerDetails: z.string().optional(),
  invoiceNo: z.string().optional(),
  receiptNo: z.string().optional(),
  notes: z.string().optional()
});

export const requestRefundSchema = z.object({
  sessionId: z.string().uuid(),
  originalPaymentId: z.string().uuid().optional().nullable(),
  originalReceiptNo: z.string().optional(),
  amount: z.number().positive("Amount must be positive"),
  reason: z.string().min(1, "Reason is required"),
  refundMethod: z.enum(["CASH", "BANK_TRANSFER", "CHEQUE", "MOBILE_MONEY", "CARD"]),
  referenceNo: z.string().optional(),
  notes: z.string().optional()
});

export const submitHandoverSchema = z.object({
  sessionId: z.string().uuid(),
  actualCounted: z.number().min(0, "Actual counted must be zero or greater"),
  varianceReason: z.string().optional()
});

export const reviewHandoverSchema = z.object({
  handoverId: z.string().uuid(),
  reviewStatus: z.enum(["APPROVED", "REJECTED"]),
  reviewNotes: z.string().optional()
});
