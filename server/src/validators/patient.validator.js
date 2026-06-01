/**
 * Patient Management Validators
 * Zod schemas for patient registration, updates, and related operations
 */

import { z } from "zod";

// ============================================
// HELPER VALIDATORS
// ============================================

const validateKePhone = (phone) => /^(\+?254|0)[17]\d{8}$/.test(phone.replace(/\s/g, ""));

const friendlyPhone = z
  .string()
  .trim()
  .refine(
    validateKePhone,
    "Please enter a valid Kenyan phone number (e.g., 0712 345 678)"
  );

const optionalPhone = z
  .string()
  .trim()
  .refine((v) => v === "" || validateKePhone(v), {
    message: "Please enter a valid phone number or leave the field empty",
  });

const optionalEmail = z
  .string()
  .trim()
  .refine((v) => v === "" || z.string().email().safeParse(v).success, {
    message: "Please enter a valid email address or leave blank",
  });

const NAME_REGEX = /^[A-Za-z][A-Za-z\s'-]*$/;
const nameField = (label) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required`)
    .min(2, `${label} must be at least 2 characters`)
    .max(100, `${label} should not exceed 100 characters`)
    .regex(NAME_REGEX, `${label} can only contain letters, spaces, hyphens, or apostrophes`);

// ============================================
// CREATE PATIENT SCHEMA
// ============================================

export const createPatientSchema = z.object({
  // Primary identifiers
  firstName: nameField("First name"),
  middleName: z.string().trim().max(100).optional().or(z.literal("")),
  lastName: nameField("Last name"),
  
  // Demographics
  gender: z.enum(["MALE", "FEMALE", "OTHER", "UNKNOWN"]),
  dateOfBirth: z.coerce.date().optional(),
  maritalStatus: z.enum(["SINGLE", "MARRIED", "DIVORCED", "WIDOWED", "UNKNOWN"]).optional(),
  
  // National IDs
  nationalId: z.string().trim().max(50).optional(),
  passportNumber: z.string().trim().max(50).optional(),
  
  // Contact information
  phone: friendlyPhone.optional(),
  alternativePhone: optionalPhone,
  email: optionalEmail,
  
  // Address
  address: z.string().trim().max(300).optional(),
  county: z.string().trim().max(100).optional(),
  city: z.string().trim().max(100).optional(),
}).superRefine((values, ctx) => {
  // Require at least one form of identification
  if (!values.nationalId && !values.passportNumber && !values.phone) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "At least one identifier is required: national ID, passport number, or phone number",
    });
  }
});

// ============================================
// UPDATE PATIENT SCHEMA
// ============================================

export const updatePatientSchema = createPatientSchema.partial();

// ============================================
// PATIENT CONTACT SCHEMA
// ============================================

export const createPatientContactSchema = z.object({
  fullName: nameField("Contact full name"),
  relationship: z.string().trim().min(1).max(100),
  phone: friendlyPhone,
  email: optionalEmail,
  address: z.string().trim().max(300).optional(),
  isEmergency: z.boolean().default(false),
  isPrimary: z.boolean().default(false),
});

export const updatePatientContactSchema = createPatientContactSchema.partial();

// ============================================
// PATIENT PAYER PROFILE SCHEMA
// ============================================

export const createPatientPayerProfileSchema = z.object({
  payerType: z.enum(["CASH", "INSURANCE", "CORPORATE", "SHA", "PATIENT_CREDIT"]),
  
  insuranceProvider: z.string().trim().max(200).optional(),
  policyNumber: z.string().trim().max(100).optional(),
  memberNumber: z.string().trim().max(100).optional(),
  
  corporateAccountId: z.string().uuid().optional(),
  creditAccountId: z.string().uuid().optional(),
  
  isDefault: z.boolean().default(false),
  notes: z.string().trim().max(1000).optional(),
}).superRefine((values, ctx) => {
  // Validate payer-specific fields
  if (values.payerType === "INSURANCE" && !values.insuranceProvider) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["insuranceProvider"],
      message: "Insurance provider is required for INSURANCE payer type",
    });
  }
  
  if (values.payerType === "SHA" && !values.memberNumber) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["memberNumber"],
      message: "Member number is required for SHA payer type",
    });
  }
  
  if (values.payerType === "CORPORATE" && !values.corporateAccountId) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["corporateAccountId"],
      message: "Corporate account is required for CORPORATE payer type",
    });
  }
});

export const updatePatientPayerProfileSchema = createPatientPayerProfileSchema.partial();

// ============================================
// PATIENT VISIT SCHEMA
// ============================================

export const createPatientVisitSchema = z.object({
  visitType: z.enum([
    "OUTPATIENT",
    "INPATIENT",
    "EMERGENCY",
    "DAYCARE",
    "WALKIN",
    "REFERRAL",
    "REVIEW",
    "FOLLOW_UP"
  ]),
  
  payerType: z.enum(["CASH", "INSURANCE", "CORPORATE", "SHA", "PATIENT_CREDIT"]),
  payerProfileId: z.string().uuid().optional(),
  
  departmentName: z.string().trim().max(200).optional(),
  clinicName: z.string().trim().max(200).optional(),
  attendingDoctorId: z.string().uuid().optional(),
  
  notes: z.string().trim().max(2000).optional(),
});

export const updatePatientVisitSchema = createPatientVisitSchema.partial();

// ============================================
// PATIENT ALERT SCHEMA
// ============================================

export const createPatientAlertSchema = z.object({
  alertType: z.enum([
    "ALLERGY",
    "FALL_RISK",
    "VIP",
    "SECURITY",
    "PAYMENT_REQUIRED",
    "CLINICAL_WARNING",
    "OTHER"
  ]),
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(1000).optional(),
});

export const updatePatientAlertSchema = createPatientAlertSchema.partial();

// ============================================
// SEARCH SCHEMA
// ============================================

export const searchPatientsSchema = z.object({
  query: z.string().trim().min(1),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// ============================================
// PATIENT STATUS CHANGE SCHEMA
// ============================================

export const changePatientStatusSchema = z.object({
  status: z.enum(["ACTIVE", "SUSPENDED", "ARCHIVED", "DECEASED"]),
  reason: z.string().trim().max(500).optional(),
});
