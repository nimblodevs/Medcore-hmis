import { z } from "zod";

export const createEmrEncounterSchema = z.object({
  patientId: z.string().uuid(),
  visitId: z.string().uuid(),
  chiefComplaint: z.string().max(1000).optional(),
  presentingHistory: z.string().max(5000).optional(),
  assignedDoctorId: z.string().uuid().optional(),
  assignedNurseId: z.string().uuid().optional()
});

export const updateEmrEncounterSchema = z.object({
  chiefComplaint: z.string().max(1000).optional(),
  presentingHistory: z.string().max(5000).optional(),
  assignedDoctorId: z.string().uuid().optional(),
  assignedNurseId: z.string().uuid().optional(),
  status: z.enum(["OPEN", "IN_PROGRESS", "READY_FOR_DISCHARGE", "CLOSED", "CANCELLED"]).optional()
});

export const recordTriageSchema = z.object({
  priority: z.enum(["RED", "ORANGE", "YELLOW", "GREEN", "BLUE", "UNKNOWN"]).default("UNKNOWN"),
  complaint: z.string().max(500).optional(),
  notes: z.string().max(2000).optional()
});

export const recordVitalsSchema = z.object({
  temperatureCelsius: z.coerce.number().min(25).max(45).optional(),
  systolicBp: z.coerce.number().int().min(40).max(300).optional(),
  diastolicBp: z.coerce.number().int().min(20).max(200).optional(),
  pulseRate: z.coerce.number().int().min(20).max(250).optional(),
  respiratoryRate: z.coerce.number().int().min(5).max(80).optional(),
  oxygenSaturation: z.coerce.number().int().min(0).max(100).optional(),
  weightKg: z.coerce.number().min(0).max(500).optional(),
  heightCm: z.coerce.number().min(20).max(250).optional(),
  painScore: z.coerce.number().int().min(0).max(10).optional(),
  notes: z.string().max(1000).optional()
});

export const createAllergySchema = z.object({
  allergen: z.string().min(2).max(200),
  reaction: z.string().max(500).optional(),
  severity: z.enum(["MILD", "MODERATE", "SEVERE", "UNKNOWN"]).default("UNKNOWN")
});

export const resolveAllergySchema = z.object({
  reason: z.string().min(2).max(500)
});

export const createClinicalNoteSchema = z.object({
  subjective: z.string().max(5000).optional(),
  objective: z.string().max(5000).optional(),
  assessment: z.string().max(5000).optional(),
  plan: z.string().max(5000).optional(),
  noteText: z.string().max(10000).optional()
});

export const signClinicalNoteSchema = z.object({
  // No additional fields needed, signer comes from auth
});

export const amendClinicalNoteSchema = z.object({
  amendmentReason: z.string().min(2).max(500),
  newContent: z.object({
    subjective: z.string().max(5000).optional(),
    objective: z.string().max(5000).optional(),
    assessment: z.string().max(5000).optional(),
    plan: z.string().max(5000).optional(),
    noteText: z.string().max(10000).optional()
  })
});

export const voidClinicalNoteSchema = z.object({
  reason: z.string().min(2).max(500)
});

export const createDiagnosisSchema = z.object({
  diagnosisType: z.enum(["PROVISIONAL", "FINAL", "DIFFERENTIAL"]),
  code: z.string().max(50).optional(),
  description: z.string().min(2).max(500),
  notes: z.string().max(1000).optional()
});

export const updateDiagnosisSchema = z.object({
  diagnosisType: z.enum(["PROVISIONAL", "FINAL", "DIFFERENTIAL"]).optional(),
  code: z.string().max(50).optional(),
  description: z.string().min(2).max(500).optional(),
  notes: z.string().max(1000).optional()
});

export const createOrderSchema = z.object({
  orderType: z.enum(["LAB", "RADIOLOGY", "PHARMACY", "PROCEDURE", "REFERRAL"]),
  itemCode: z.string().max(100).optional(),
  description: z.string().min(2).max(500),
  priority: z.enum(["ROUTINE", "URGENT", "STAT"]).default("ROUTINE"),
  targetModule: z.string().max(100).optional(),
  notes: z.string().max(1000).optional()
});

export const submitOrderSchema = z.object({
  // No additional fields needed, submitter comes from auth
});

export const cancelOrderSchema = z.object({
  cancellationReason: z.string().min(2).max(500)
});

export const createPrescriptionSchema = z.object({
  medicationName: z.string().min(2).max(200),
  genericName: z.string().max(200).optional(),
  dosage: z.string().max(100).optional(),
  frequency: z.string().max(100).optional(),
  duration: z.string().max(100).optional(),
  route: z.string().max(100).optional(),
  quantity: z.coerce.number().int().positive().optional(),
  instructions: z.string().max(500).optional()
});

export const cancelPrescriptionSchema = z.object({
  cancellationReason: z.string().min(2).max(500)
});

export const createDischargeSummarySchema = z.object({
  finalDiagnosis: z.string().max(1000).optional(),
  treatmentGiven: z.string().max(5000).optional(),
  proceduresDone: z.string().max(2000).optional(),
  dischargeCondition: z.string().max(500).optional(),
  dischargeMedications: z.string().max(2000).optional(),
  followUpInstructions: z.string().max(2000).optional()
});

export const signDischargeSummarySchema = z.object({
  // No additional fields needed, signer comes from auth
});

export const closeEncounterSchema = z.object({
  // No additional fields needed, closer comes from auth
});

export const cancelEncounterSchema = z.object({
  cancellationReason: z.string().min(2).max(500)
});
