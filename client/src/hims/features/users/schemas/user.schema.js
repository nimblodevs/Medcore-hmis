import { z } from "zod";

export const createUserSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters").max(100),
  lastName: z.string().min(2, "Last name must be at least 2 characters").max(100),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().max(20).optional(),
  role: z.enum([
    "SUPER_ADMIN",
    "ADMIN",
    "CASHIER_SUPERVISOR",
    "CASHIER",
    "FINANCE_MANAGER",
    "AUDITOR"
  ])
});

export const updateUserSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters").max(100).optional(),
  lastName: z.string().min(2, "Last name must be at least 2 characters").max(100).optional(),
  phone: z.string().max(20).optional(),
  role: z.enum([
    "SUPER_ADMIN",
    "ADMIN",
    "CASHIER_SUPERVISOR",
    "CASHIER",
    "FINANCE_MANAGER",
    "AUDITOR"
  ]).optional()
});

export const resetPasswordSchema = z.object({
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});
