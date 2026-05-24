import { z } from "zod";

export const contactTypeSchema = z.enum([
  "BILLING",
  "CLAIMS",
  "FINANCE",
  "AUTHORIZATION",
  "GENERAL"
]);

export const createDebtorContactSchema = z.object({
  contactType: contactTypeSchema.default("GENERAL"),

  fullName: z.string().min(2, "Full name must be at least 2 characters").max(160, "Full name is too long"),
  jobTitle: z.string().max(120, "Job title is too long").optional(),
  
  phone: z.string().max(30, "Phone number is too long").optional(),
  email: z.string().email("Invalid email format").optional().or(z.literal("")),
  
  isPrimary: z.boolean().default(false),
  notes: z.string().max(1000, "Notes are too long").optional()
});

export const updateDebtorContactSchema = createDebtorContactSchema.partial();

export default {
  createDebtorContactSchema,
  updateDebtorContactSchema,
  contactTypeSchema
};
