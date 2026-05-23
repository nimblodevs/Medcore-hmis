// EMR Module Exports
export * from "./services/emr-encounter.service.js";
export * from "./services/emr-audit.service.js";

// Validators
export {
  createEmrEncounterSchema,
  updateEmrEncounterSchema,
  recordTriageSchema,
  recordVitalsSchema,
  createAllergySchema,
  resolveAllergySchema,
  createClinicalNoteSchema,
  signClinicalNoteSchema,
  amendClinicalNoteSchema,
  voidClinicalNoteSchema,
  createDiagnosisSchema,
  updateDiagnosisSchema,
  createOrderSchema,
  submitOrderSchema,
  cancelOrderSchema,
  createPrescriptionSchema,
  cancelPrescriptionSchema,
  createDischargeSummarySchema,
  signDischargeSummarySchema,
  closeEncounterSchema,
  cancelEncounterSchema
} from "./validators/emr.validator.js";
