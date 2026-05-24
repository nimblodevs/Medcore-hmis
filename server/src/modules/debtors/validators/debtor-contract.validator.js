import { z } from "zod";
import { billingCycleSchema } from "./debtor-account.validator.js";

export const createDebtorContractSchema = z.object({
  contractNumber: z.string().max(100, "Contract number is too long").optional(),
  contractName: z.string().min(2, "Contract name must be at least 2 characters").max(200, "Contract name is too long"),

  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional(),

  billingCycle: billingCycleSchema.default("MONTHLY"),
  paymentTermsDays: z.coerce.number().int().min(0).max(365).default(30),

  creditLimit: z.coerce.number().min(0).optional(),

  requiresPreAuthorization: z.boolean().default(false),

  outpatientAllowed: z.boolean().default(true),
  inpatientAllowed: z.boolean().default(true),
  pharmacyAllowed: z.boolean().default(true),
  laboratoryAllowed: z.boolean().default(true),
  radiologyAllowed: z.boolean().default(true),

  notes: z.string().max(2000, "Notes are too long").optional()
});

export const updateDebtorContractSchema = createDebtorContractSchema.partial();

export default {
  createDebtorContractSchema,
  updateDebtorContractSchema
};
