import { z } from "zod";

const registerSchema = z.object({
  firstName: z.string().min(2),
  middleName: z.string().optional(),
  lastName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  staffId: z.string().optional(),
  jobTitle: z.string().optional(),
  gender: z.string().optional(),
  dateOfBirth: z.coerce.date().optional(),
  address: z.string().optional(),
  password: z.string().min(8),
  tenantId: z.string().uuid().optional(),
  isSuperAdmin: z.boolean().optional()
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

const refreshTokenSchema = z.object({
  refreshToken: z.string().min(10)
});

export {
  registerSchema,
  loginSchema,
  refreshTokenSchema
};
