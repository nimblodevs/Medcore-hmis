import { z } from "zod";

export const appointmentTypes = [
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
];

export const appointmentPriorities = ["ROUTINE", "URGENT", "EMERGENCY"];

export const appointmentSources = [
  "WALK_IN",
  "PHONE",
  "FRONT_DESK",
  "DOCTOR_REQUEST",
  "FOLLOW_UP",
  "REFERRAL",
  "ONLINE"
];

export const appointmentStatuses = [
  "DRAFT",
  "BOOKED",
  "CONFIRMED",
  "CHECKED_IN",
  "IN_PROGRESS",
  "COMPLETED",
  "RESCHEDULED",
  "CANCELLED",
  "NO_SHOW"
];

export const createAppointmentSchema = z.object({
  patientId: z.string().uuid("Please select a valid patient"),

  departmentId: z.string().uuid().optional(),
  clinicId: z.string().uuid().optional(),
  serviceUnitId: z.string().uuid().optional(),
  doctorId: z.string().uuid().optional(),

  appointmentType: z.enum(appointmentTypes, {
    required_error: "Appointment type is required"
  }),

  priority: z.enum(appointmentPriorities).default("ROUTINE"),

  source: z.enum(appointmentSources).default("FRONT_DESK"),

  scheduledStartAt: z.coerce.date({
    required_error: "Start time is required"
  }),
  scheduledEndAt: z.coerce.date({
    required_error: "End time is required"
  }),

  reason: z.string().max(1000, "Reason must be less than 1000 characters").optional(),
  notes: z.string().max(1000, "Notes must be less than 1000 characters").optional()
});

export const rescheduleAppointmentSchema = z.object({
  scheduledStartAt: z.coerce.date({
    required_error: "New start time is required"
  }),
  scheduledEndAt: z.coerce.date({
    required_error: "New end time is required"
  }),
  rescheduleReason: z.string().min(3, "Reason must be at least 3 characters").max(1000, "Reason must be less than 1000 characters")
});

export const cancelAppointmentSchema = z.object({
  cancellationReason: z.string().min(3, "Reason must be at least 3 characters").max(1000, "Reason must be less than 1000 characters")
});

export const checkInAppointmentSchema = z.object({
  notes: z.string().max(1000).optional()
});

export const noShowAppointmentSchema = z.object({
  reason: z.string().min(3).max(1000).optional()
});

export default createAppointmentSchema;
