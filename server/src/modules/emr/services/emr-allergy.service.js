import prisma from "../../config/database.js";
import { AllergySeverity } from "@prisma/client";
import { recordAllergyCreated, recordAllergyResolved } from "./emr-audit.service.js";

/**
 * Create an allergy record for a patient during an encounter
 */
export async function createAllergy(encounterId, data, user, ipAddress, userAgent) {
  const { allergen, reaction, severity } = data;

  // Verify encounter exists
  const encounter = await prisma.emrEncounter.findUnique({
    where: { id: encounterId },
    include: { patient: true }
  });

  if (!encounter) {
    throw new Error("Encounter not found");
  }

  // Check for existing active allergy with same allergen
  const existingAllergy = await prisma.emrAllergy.findFirst({
    where: {
      patientId: encounter.patientId,
      allergen: {
        equals: allergen,
        mode: 'insensitive'
      },
      isActive: true
    }
  });

  if (existingAllergy) {
    throw new Error("Patient already has an active allergy to this substance");
  }

  // Create allergy record
  const allergyRecord = await prisma.emrAllergy.create({
    data: {
      encounterId,
      patientId: encounter.patientId,
      allergen,
      reaction,
      severity: severity || AllergySeverity.UNKNOWN,
      isActive: true,
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
  await recordAllergyCreated(
    encounterId,
    encounter.patientId,
    user?.id,
    "EmrAllergy",
    allergyRecord.id,
    null,
    { allergen, reaction, severity },
    ipAddress,
    userAgent
  );

  return allergyRecord;
}

/**
 * Get active allergies for a patient
 */
export async function getPatientAllergies(patientId) {
  const allergies = await prisma.emrAllergy.findMany({
    where: {
      patientId,
      isActive: true
    },
    orderBy: { createdAt: 'desc' },
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

  return allergies;
}

/**
 * Get allergies for an encounter
 */
export async function getEncounterAllergies(encounterId) {
  const allergies = await prisma.emrAllergy.findMany({
    where: { encounterId },
    orderBy: { createdAt: 'desc' },
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

  return allergies;
}

/**
 * Resolve an allergy
 */
export async function resolveAllergy(allergyId, reason, user, ipAddress, userAgent) {
  const allergy = await prisma.emrAllergy.findUnique({
    where: { id: allergyId },
    include: {
      encounter: {
        include: {
          patient: true
        }
      }
    }
  });

  if (!allergy) {
    throw new Error("Allergy not found");
  }

  if (!allergy.isActive) {
    throw new Error("Allergy is already resolved");
  }

  const previousValues = { isActive: true };
  const newValues = { 
    isActive: false, 
    resolvedById: user?.id,
    resolvedAt: new Date()
  };

  // Update allergy
  const updatedAllergy = await prisma.emrAllergy.update({
    where: { id: allergyId },
    data: newValues
  });

  // Audit log
  await recordAllergyResolved(
    allergy.encounterId,
    allergy.patientId,
    user?.id,
    "EmrAllergy",
    allergyId,
    previousValues,
    { ...newValues, reason },
    ipAddress,
    userAgent
  );

  return updatedAllergy;
}
