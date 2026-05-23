import { z } from "zod";

export const createDepartmentSchema = z.object({
  name: z.string().min(2).max(160),
  code: z.string().min(2).max(30),
  description: z.string().max(1000).optional(),
  departmentType: z.enum([
    "CLINICAL",
    "DIAGNOSTIC",
    "PHARMACY",
    "ADMINISTRATIVE",
    "FINANCE",
    "SUPPORT",
    "OTHER"
  ]).default("OTHER"),
  managerId: z.string().uuid().optional(),
  location: z.string().max(160).optional(),
  phone: z.string().max(30).optional(),
  email: z.string().email().optional()
});

export const updateDepartmentSchema = z.object({
  name: z.string().min(2).max(160).optional(),
  code: z.string().min(2).max(30).optional(),
  description: z.string().max(1000).optional(),
  departmentType: z.enum([
    "CLINICAL",
    "DIAGNOSTIC",
    "PHARMACY",
    "ADMINISTRATIVE",
    "FINANCE",
    "SUPPORT",
    "OTHER"
  ]).optional(),
  managerId: z.string().uuid().optional().nullable(),
  location: z.string().max(160).optional(),
  phone: z.string().max(30).optional(),
  email: z.string().email().optional().nullable()
});

export const createServiceUnitSchema = z.object({
  name: z.string().min(2).max(160),
  code: z.string().min(2).max(30),
  description: z.string().max(1000).optional(),
  location: z.string().max(160).optional()
});

export const updateServiceUnitSchema = z.object({
  name: z.string().min(2).max(160).optional(),
  code: z.string().min(2).max(30).optional(),
  description: z.string().max(1000).optional(),
  location: z.string().max(160).optional()
});

export const assignUserToDepartmentSchema = z.object({
  userId: z.string().uuid(),
  serviceUnitId: z.string().uuid().optional(),
  isPrimary: z.boolean().default(false)
});

export const assignManagerSchema = z.object({
  managerId: z.string().uuid()
});

export const changeStatusSchema = z.object({
  reason: z.string().max(500).optional()
});
