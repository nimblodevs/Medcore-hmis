import prisma from "../../config/database.js";
import { ClinicalRecordStatus, TriagePriority } from "@prisma/client";
import { recordTriageRecorded } from "./emr-audit.service.js";

/**
 * Record triage information for an encounter
 */
export async function recordTriage(encounterId, data, user, ipAddress, userAgent) {
  const { priority, complaint, notes } = data;

  // Verify encounter exists and is open/in-progress
  const encounter = await prisma.emrEncounter.findUnique({
    where: { id: encounterId },
    include: { patient: true }
  });

  if (!encounter) {
    throw new Error("Encounter not found");
  }

  if (encounter.status === 'CLOSED' || encounter.status === 'CANCELLED') {
    throw new Error("Cannot record triage for closed or cancelled encounter");
  }

  // Create triage record
  const triageRecord = await prisma.emrTriage.create({
    data: {
      encounterId,
      priority: priority || TriagePriority.UNKNOWN,
      complaint,
      notes,
      recordedById: user?.id,
      status: ClinicalRecordStatus.SIGNED
    },
    include: {
      encounter: {
        include: {
          patient: true
        }
      }
    }
  });

  // Audit log
  await recordTriageRecorded(
    encounterId,
    encounter.patientId,
    user?.id,
    "EmrTriage",
    triageRecord.id,
    null,
    { priority, complaint, notes },
    ipAddress,
    userAgent
  );

  return triageRecord;
}

/**
 * Get triage records for an encounter
 */
export async function getTriageRecords(encounterId) {
  const triageRecords = await prisma.emrTriage.findMany({
    where: { encounterId },
    orderBy: { recordedAt: 'desc' },
    include: {
      recordedBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true
        }
      }
    }
  });

  return triageRecords;
}

/**
 * Get latest triage record for an encounter
 */
export async function getLatestTriage(encounterId) {
  const triageRecord = await prisma.emrTriage.findFirst({
    where: { encounterId },
    orderBy: { recordedAt: 'desc' },
    include: {
      recordedBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true
        }
      }
    }
  });

  return triageRecord;
}
