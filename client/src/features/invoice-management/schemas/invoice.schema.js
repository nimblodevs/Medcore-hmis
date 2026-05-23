import { z } from "zod";

export const createInvoiceSchema = z.object({
  invoiceType: z.enum(["INSURANCE", "CORPORATE", "SHA", "PATIENT_CREDIT"], {
    required_error: "Invoice type is required",
  }),
  creditAccountId: z.string().uuid("Please select a valid credit account"),
  patientName: z.string().optional(),
  patientNumber: z.string().optional(),
  encounterNumber: z.string().optional(),
  dueDate: z.coerce.date({
    required_error: "Due date is required",
  }),
  notes: z.string().max(1000, "Notes cannot exceed 1000 characters").optional(),
});

export const invoiceLineItemSchema = z.object({
  itemType: z.enum(
    [
      "CONSULTATION",
      "LABORATORY",
      "RADIOLOGY",
      "PHARMACY",
      "PROCEDURE",
      "ROOM_CHARGE",
      "SURGERY",
      "OTHER",
    ],
    {
      required_error: "Item type is required",
    }
  ),
  itemCode: z.string().optional(),
  description: z.string().min(2, "Description must be at least 2 characters"),
  quantity: z.coerce.number().positive("Quantity must be greater than 0"),
  unitPrice: z.coerce.number().positive("Unit price must be greater than 0"),
  serviceDate: z.coerce.date().optional(),
  notes: z.string().max(500, "Notes cannot exceed 500 characters").optional(),
});

export const updateInvoiceSchema = z.object({
  patientName: z.string().optional(),
  patientNumber: z.string().optional(),
  encounterNumber: z.string().optional(),
  dueDate: z.coerce.date().optional(),
  notes: z.string().max(1000).optional(),
});

export const approveInvoiceSchema = z.object({
  // No additional fields needed for approval
});

export const cancelInvoiceSchema = z.object({
  reason: z.string().min(10, "Cancellation reason must be at least 10 characters"),
});

export const disputeInvoiceSchema = z.object({
  reason: z.string().min(10, "Dispute reason must be at least 10 characters"),
});

export const writeOffInvoiceSchema = z.object({
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  reason: z.string().min(10, "Write-off reason must be at least 10 characters"),
});

export const adjustmentSchema = z.object({
  adjustmentType: z.enum(["DISCOUNT", "CREDIT_NOTE", "DEBIT_NOTE", "WRITE_OFF"], {
    required_error: "Adjustment type is required",
  }),
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  reason: z.string().min(10, "Reason must be at least 10 characters"),
});
