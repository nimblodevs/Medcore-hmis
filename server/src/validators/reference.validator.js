import { z } from "zod";

export const nextReferenceSchema = z.object({
  type: z.enum(["INVOICE", "BILL", "DISPATCH_NOTE", "CLAIM_REFERENCE", "RECEIPT"]),
  tenantId: z.string().uuid().optional(),
  branchId: z.string().uuid().optional(),
  prefix: z.string().min(2).max(16).optional()
});

