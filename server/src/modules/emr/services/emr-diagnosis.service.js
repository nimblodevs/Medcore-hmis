import prisma from "../../config/database.js";
import { DiagnosisType } from "@prisma/client";
import { recordDiagnosisAdded } from "./emr-audit.service.js";

/**
 * Add a diagnosis to an encounter
 */
export async function addDiagnosis(encounterId, data, user, ipAddress, userAgent) {
  const { diagnosisType, code, description, notes } = data;

  // Verify encounter exists and is open/in-progress
  const encounter = await prisma.emrEncounter.findUnique({
    where: { id: encounterId },
    include: { patient: true }
  });

  if (!encounter) {
    throw new Error("Encounter not found");
  }

  if (encounter.status === 'CLOSED' || encounter.status === 'CANCELLED') {
    throw new Error("Cannot add diagnosis to closed or cancelled encounter");
  }

  // Create diagnosis
  const diagnosis = await prisma.emrDiagnosis.create({
    data: {
      encounterId,
      diagnosisType: diagnosisType || DiagnosisType.PROVISIONAL,
      code,
      description,
      notes,
      recordedById: user?.id
    },
    include: {
      encounter: {
        include: {
          patient: true
        }
      },
      recordedBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true
        }
      }
    }
  });

  // Audit log
  await recordDiagnosisAdded(
    encounterId,
    encounter.patientId,
    user?.id,
    "EmrDiagnosis",
    diagnosis.id,
    null,
    { diagnosisType, code, description, notes },
    ipAddress,
    userAgent
  );

  return diagnosis;
}

/**
 * Get diagnoses for an encounter
 */
export async function getDiagnoses(encounterId) {
  const diagnoses = await prisma.emrDiagnosis.findMany({
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

  return diagnoses;
}

/**
 * Update a diagnosis
 */
export async function updateDiagnosis(diagnosisId, data, user, ipAddress, userAgent) {
  const diagnosis = await prisma.emrDiagnosis.findUnique({
    where: { id: diagnosisId },
    include: {
      encounter: {
        include: {
          patient: true
        }
      }
    }
  });

  if (!diagnosis) {
    throw new Error("Diagnosis not found");
  }

  const encounter = await prisma.emrEncounter.findUnique({
    where: { id: diagnosis.encounterId }
  });

  if (encounter && (encounter.status === 'CLOSED' || encounter.status === 'CANCELLED')) {
    throw new Error("Cannot update diagnosis in closed or cancelled encounter");
  }

  const previousValues = {
    diagnosisType: diagnosis.diagnosisType,
    code: diagnosis.code,
    description: diagnosis.description,
    notes: diagnosis.notes
  };

  // Update diagnosis
  const updatedDiagnosis = await prisma.emrDiagnosis.update({
    where: { id: diagnosisId },
    data: {
      ...data,
      recordedById: user?.id
    }
  });

  // Audit log
  await recordDiagnosisAdded(
    diagnosis.encounterId,
    diagnosis.patientId,
    user?.id,
    "EmrDiagnosis",
    diagnosisId,
    previousValues,
    data,
    ipAddress,
    userAgent
  );

  return updatedDiagnosis;
}

/**
 * Delete a diagnosis
 */
export async function deleteDiagnosis(diagnosisId, user, ipAddress, userAgent) {
  const diagnosis = await prisma.emrDiagnosis.findUnique({
    where: { id: diagnosisId },
    include: {
      encounter: {
        include: {
          patient: true
        }
      }
    }
  });

  if (!diagnosis) {
    throw new Error("Diagnosis not found");
  }

  const encounter = await prisma.emrEncounter.findUnique({
    where: { id: diagnosis.encounterId }
  });

  if (encounter && (encounter.status === 'CLOSED' || encounter.status === 'CANCELLED')) {
    throw new Error("Cannot delete diagnosis from closed or cancelled encounter");
  }

  // Delete diagnosis
  await prisma.emrDiagnosis.delete({
    where: { id: diagnosisId }
  });

  // Audit log
  await recordDiagnosisAdded(
    diagnosis.encounterId,
    diagnosis.patientId,
    user?.id,
    "EmrDiagnosis",
    diagnosisId,
    { deleted: true, ...diagnosis },
    { deleted: true, deletedBy: user?.id },
    ipAddress,
    userAgent
  );

  return { success: true, message: "Diagnosis deleted successfully" };
}

/**
 * Get final diagnoses for an encounter
 */
export async function getFinalDiagnoses(encounterId) {
  const diagnoses = await prisma.emrDiagnosis.findMany({
    where: { 
      encounterId,
      diagnosisType: 'FINAL'
    },
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

  return diagnoses;
}
