import prisma from "../../config/database.js";
import { EmrAuditAction } from "@prisma/client";

/**
 * Create EMR audit log entry
 */
export async function createEmrAuditLog(tx, data) {
  const auditData = {
    ...data,
    createdAt: new Date()
  };

  return tx.emrAuditLog.create({
    data: auditData
  });
}

/**
 * Log EMR encounter action
 */
export async function logEncounterAction(encounterId, patientId, actorId, action, entityType, entityId, previousValues, newValues, reason, ipAddress, userAgent) {
  return prisma.emrAuditLog.create({
    data: {
      encounterId,
      patientId,
      actorId,
      action,
      entityType,
      entityId,
      previousValues,
      newValues,
      reason,
      ipAddress,
      userAgent
    }
  });
}

/**
 * Get audit logs for an encounter
 */
export async function getEncounterAuditLogs(encounterId, options = {}) {
  const { limit = 50, offset = 0 } = options;

  return prisma.emrAuditLog.findMany({
    where: {
      encounterId
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: limit,
    skip: offset,
    include: {
      encounter: {
        select: {
          id: true,
          patientId: true
        }
      }
    }
  });
}

/**
 * Get audit logs for a patient across all encounters
 */
export async function getPatientEmrAuditLogs(patientId, options = {}) {
  const { limit = 100, offset = 0 } = options;

  return prisma.emrAuditLog.findMany({
    where: {
      patientId
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: limit,
    skip: offset,
    include: {
      encounter: {
        select: {
          id: true,
          visitId: true
        }
      }
    }
  });
}

/**
 * Get audit logs by action type
 */
export async function getAuditLogsByAction(action, options = {}) {
  const { limit = 100, offset = 0, encounterId, actorId } = options;

  const where = {
    action
  };

  if (encounterId) {
    where.encounterId = encounterId;
  }

  if (actorId) {
    where.actorId = actorId;
  }

  return prisma.emrAuditLog.findMany({
    where,
    orderBy: {
      createdAt: 'desc'
    },
    take: limit,
    skip: offset
  });
}

/**
 * Record encounter creation audit
 */
export async function recordEncounterCreated(tx, encounterId, patientId, actorId, ipAddress, userAgent) {
  return createEmrAuditLog(tx, {
    encounterId,
    patientId,
    actorId,
    action: EmrAuditAction.ENCOUNTER_CREATED,
    entityType: 'EmrEncounter',
    entityId: encounterId,
    ipAddress,
    userAgent
  });
}

/**
 * Record encounter update audit
 */
export async function recordEncounterUpdated(tx, encounterId, patientId, actorId, previousValues, newValues, ipAddress, userAgent) {
  return createEmrAuditLog(tx, {
    encounterId,
    patientId,
    actorId,
    action: EmrAuditAction.ENCOUNTER_UPDATED,
    entityType: 'EmrEncounter',
    entityId: encounterId,
    previousValues,
    newValues,
    ipAddress,
    userAgent
  });
}

/**
 * Record encounter closure audit
 */
export async function recordEncounterClosed(tx, encounterId, patientId, actorId, ipAddress, userAgent) {
  return createEmrAuditLog(tx, {
    encounterId,
    patientId,
    actorId,
    action: EmrAuditAction.ENCOUNTER_CLOSED,
    entityType: 'EmrEncounter',
    entityId: encounterId,
    ipAddress,
    userAgent
  });
}

/**
 * Record vitals recorded audit
 */
export async function recordVitalsRecorded(tx, encounterId, patientId, actorId, vitalId, ipAddress, userAgent) {
  return createEmrAuditLog(tx, {
    encounterId,
    patientId,
    actorId,
    action: EmrAuditAction.VITALS_RECORDED,
    entityType: 'EmrVitalSign',
    entityId: vitalId,
    ipAddress,
    userAgent
  });
}

/**
 * Record triage recorded audit
 */
export async function recordTriageRecorded(tx, encounterId, patientId, actorId, triageId, ipAddress, userAgent) {
  return createEmrAuditLog(tx, {
    encounterId,
    patientId,
    actorId,
    action: EmrAuditAction.TRIAGE_RECORDED,
    entityType: 'EmrTriage',
    entityId: triageId,
    ipAddress,
    userAgent
  });
}

/**
 * Record clinical note created audit
 */
export async function recordNoteCreated(tx, encounterId, patientId, actorId, noteId, ipAddress, userAgent) {
  return createEmrAuditLog(tx, {
    encounterId,
    patientId,
    actorId,
    action: EmrAuditAction.NOTE_CREATED,
    entityType: 'EmrClinicalNote',
    entityId: noteId,
    ipAddress,
    userAgent
  });
}

/**
 * Record clinical note signed audit
 */
export async function recordNoteSigned(tx, encounterId, patientId, actorId, noteId, ipAddress, userAgent) {
  return createEmrAuditLog(tx, {
    encounterId,
    patientId,
    actorId,
    action: EmrAuditAction.NOTE_SIGNED,
    entityType: 'EmrClinicalNote',
    entityId: noteId,
    ipAddress,
    userAgent
  });
}

/**
 * Record clinical note amended audit
 */
export async function recordNoteAmended(tx, encounterId, patientId, actorId, noteId, amendmentReason, ipAddress, userAgent) {
  return createEmrAuditLog(tx, {
    encounterId,
    patientId,
    actorId,
    action: EmrAuditAction.NOTE_AMENDED,
    entityType: 'EmrClinicalNote',
    entityId: noteId,
    newValues: { amendmentReason },
    ipAddress,
    userAgent
  });
}

/**
 * Record diagnosis added audit
 */
export async function recordDiagnosisAdded(tx, encounterId, patientId, actorId, diagnosisId, ipAddress, userAgent) {
  return createEmrAuditLog(tx, {
    encounterId,
    patientId,
    actorId,
    action: EmrAuditAction.DIAGNOSIS_ADDED,
    entityType: 'EmrDiagnosis',
    entityId: diagnosisId,
    ipAddress,
    userAgent
  });
}

/**
 * Record order created audit
 */
export async function recordOrderCreated(tx, encounterId, patientId, actorId, orderId, ipAddress, userAgent) {
  return createEmrAuditLog(tx, {
    encounterId,
    patientId,
    actorId,
    action: EmrAuditAction.ORDER_CREATED,
    entityType: 'EmrOrder',
    entityId: orderId,
    ipAddress,
    userAgent
  });
}

/**
 * Record order cancelled audit
 */
export async function recordOrderCancelled(tx, encounterId, patientId, actorId, orderId, reason, ipAddress, userAgent) {
  return createEmrAuditLog(tx, {
    encounterId,
    patientId,
    actorId,
    action: EmrAuditAction.ORDER_CANCELLED,
    entityType: 'EmrOrder',
    entityId: orderId,
    newValues: { cancellationReason: reason },
    ipAddress,
    userAgent
  });
}

/**
 * Record prescription created audit
 */
export async function recordPrescriptionCreated(tx, encounterId, patientId, actorId, prescriptionId, ipAddress, userAgent) {
  return createEmrAuditLog(tx, {
    encounterId,
    patientId,
    actorId,
    action: EmrAuditAction.PRESCRIPTION_CREATED,
    entityType: 'EmrPrescription',
    entityId: prescriptionId,
    ipAddress,
    userAgent
  });
}

/**
 * Record discharge summary created audit
 */
export async function recordDischargeSummaryCreated(tx, encounterId, patientId, actorId, dischargeId, ipAddress, userAgent) {
  return createEmrAuditLog(tx, {
    encounterId,
    patientId,
    actorId,
    action: EmrAuditAction.DISCHARGE_SUMMARY_CREATED,
    entityType: 'EmrDischargeSummary',
    entityId: dischargeId,
    ipAddress,
    userAgent
  });
}
