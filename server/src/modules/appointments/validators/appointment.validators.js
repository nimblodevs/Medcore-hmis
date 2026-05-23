import { z } from "zod";

export const createAppointmentSchema = z.object({
  patientId: z.string().uuid(),

  departmentId: z.string().uuid().optional(),
  clinicId: z.string().uuid().optional(),
  serviceUnitId: z.string().uuid().optional(),
  doctorId: z.string().uuid().optional(),

  appointmentType: z.enum([
    "NEW_CONSULTATION",
    "FOLLOW_UP",
    "SPECIALIST_CONSULTATION",
    "PROCEDURE",
    "REVIEW",
    "ANTENATAL",
    "DENTAL",
    "EYE",
    "PHYSIOTHERAPY",
    "COUNSELLING",
    "OTHER"
  ]),

  priority: z.enum(["ROUTINE", "URGENT", "EMERGENCY"]).default("ROUTINE"),

  source: z.enum([
    "WALK_IN",
    "PHONE",
    "FRONT_DESK",
    "DOCTOR_REQUEST",
    "FOLLOW_UP",
    "REFERRAL",
    "ONLINE"
  ]).default("FRONT_DESK"),

  scheduledStartAt: z.coerce.date(),
  scheduledEndAt: z.coerce.date(),

  reason: z.string().max(1000).optional(),
  notes: z.string().max(1000).optional()
});

export const updateAppointmentSchema = z.object({
  departmentId: z.string().uuid().optional(),
  clinicId: z.string().uuid().optional(),
  serviceUnitId: z.string().uuid().optional(),
  doctorId: z.string().uuid().optional(),
  appointmentType: z.enum([
    "NEW_CONSULTATION",
    "FOLLOW_UP",
    "SPECIALIST_CONSULTATION",
    "PROCEDURE",
    "REVIEW",
    "ANTENATAL",
    "DENTAL",
    "EYE",
    "PHYSIOTHERAPY",
    "COUNSELLING",
    "OTHER"
  ]).optional(),
  priority: z.enum(["ROUTINE", "URGENT", "EMERGENCY"]).optional(),
  reason: z.string().max(1000).optional(),
  notes: z.string().max(1000).optional()
});

export const rescheduleAppointmentSchema = z.object({
  scheduledStartAt: z.coerce.date(),
  scheduledEndAt: z.coerce.date(),
  rescheduleReason: z.string().min(3).max(1000)
});

export const cancelAppointmentSchema = z.object({
  cancellationReason: z.string().min(3).max(1000)
});

export const confirmAppointmentSchema = z.object({
  notes: z.string().max(1000).optional()
});

export const checkInAppointmentSchema = z.object({
  notes: z.string().max(1000).optional()
});

export const noShowAppointmentSchema = z.object({
  reason: z.string().min(3).max(1000).optional()
});

export const completeAppointmentSchema = z.object({
  notes: z.string().max(1000).optional()
});

// Slot schemas
export const createAppointmentSlotSchema = z.object({
  departmentId: z.string().uuid().optional(),
  clinicId: z.string().uuid().optional(),
  doctorId: z.string().uuid().optional(),
  serviceUnitId: z.string().uuid().optional(),
  startAt: z.coerce.date(),
  endAt: z.coerce.date(),
  capacity: z.coerce.number().int().min(1).max(100).default(1)
});

export const updateAppointmentSlotSchema = z.object({
  capacity: z.coerce.number().int().min(1).max(100).optional(),
  isBlocked: z.boolean().optional(),
  blockReason: z.string().max(500).optional()
});

export const blockSlotSchema = z.object({
  blockReason: z.string().min(3).max(500)
});

// Schedule template schemas
export const createScheduleTemplateSchema = z.object({
  name: z.string().min(3).max(100),
  departmentId: z.string().uuid().optional(),
  clinicId: z.string().uuid().optional(),
  doctorId: z.string().uuid().optional(),
  dayOfWeek: z.coerce.number().int().min(0).max(6),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  slotMinutes: z.coerce.number().int().min(5).max(120).default(30),
  capacityPerSlot: z.coerce.number().int().min(1).max(100).default(1)
});

export const updateScheduleTemplateSchema = z.object({
  name: z.string().min(3).max(100).optional(),
  dayOfWeek: z.coerce.number().int().min(0).max(6).optional(),
  startTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  endTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  slotMinutes: z.coerce.number().int().min(5).max(120).optional(),
  capacityPerSlot: z.coerce.number().int().min(1).max(100).optional(),
  isActive: z.boolean().optional()
});
