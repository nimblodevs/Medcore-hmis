import { z } from "zod";

const invoiceItemInputSchema = z.object({
  servicePoint: z.string().min(2),
  itemCode: z.string().optional(),
  description: z.string().min(2),
  quantity: z.coerce.number().positive(),
  unitPrice: z.coerce.number().nonnegative(),
  discountAmount: z.coerce.number().nonnegative().default(0),
  netAmount: z.coerce.number().nonnegative()
});

const createInvoiceSchema = z.object({
  tenantId: z.string().uuid().optional(),
  branchId: z.string().uuid(),
  invoiceDate: z.coerce.date(),
  patientId: z.string().uuid(),
  visitId: z.string().uuid(),
  creditCustomerId: z.string().uuid().nullable().optional(),
  schemeId: z.string().uuid().nullable().optional(),
  billingType: z.enum(["CASH", "CREDIT", "INSURANCE"]),
  authorizationNo: z.string().optional(),
  grossAmount: z.coerce.number().nonnegative(),
  discountAmount: z.coerce.number().nonnegative().default(0),
  netAmount: z.coerce.number().nonnegative(),
  patientCopayAmount: z.coerce.number().nonnegative().default(0),
  creditAmount: z.coerce.number().nonnegative(),
  notes: z.string().optional(),
  items: z.array(invoiceItemInputSchema).min(1)
});

const updateInvoiceSchema = z.object({
  authorizationNo: z.string().optional(),
  notes: z.string().optional(),
  discountAmount: z.coerce.number().nonnegative().optional(),
  patientCopayAmount: z.coerce.number().nonnegative().optional(),
  creditAmount: z.coerce.number().nonnegative().optional(),
  netAmount: z.coerce.number().nonnegative().optional()
});

const createInvoiceItemSchema = invoiceItemInputSchema;

const updateInvoiceItemSchema = invoiceItemInputSchema.partial().refine((data) => Object.keys(data).length > 0, {
  message: "At least one field is required"
});

const approvalDecisionSchema = z.object({
  comments: z.string().optional()
});

export {
  createInvoiceSchema,
  updateInvoiceSchema,
  createInvoiceItemSchema,
  updateInvoiceItemSchema,
  approvalDecisionSchema
};
