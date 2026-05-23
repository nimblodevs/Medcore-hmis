import prisma from "../../config/database.js";
import { ClinicalRecordStatus } from "@prisma/client";
import { recordVitalsRecorded } from "./emr-audit.service.js";

/**
 * Record vital signs for an encounter
 */
export async function recordVitals(encounterId, data, user, ipAddress, userAgent) {
  const {
    temperatureCelsius,
    systolicBp,
    diastolicBp,
    pulseRate,
    respiratoryRate,
    oxygenSaturation,
    weightKg,
    heightCm,
    painScore,
    notes
  } = data;

  // Verify encounter exists and is open/in-progress
  const encounter = await prisma.emrEncounter.findUnique({
    where: { id: encounterId },
    include: { patient: true }
  });

  if (!encounter) {
    throw new Error("Encounter not found");
  }

  if (encounter.status === 'CLOSED' || encounter.status === 'CANCELLED') {
    throw new Error("Cannot record vitals for closed or cancelled encounter");
  }

  // Calculate BMI if weight and height provided
  let bmi = null;
  if (weightKg && heightCm) {
    const heightInMeters = heightCm / 100;
    bmi = parseFloat((weightKg / (heightInMeters * heightInMeters)).toFixed(2));
  }

  // Create vitals record (append-only)
  const vitalsRecord = await prisma.emrVitalSign.create({
    data: {
      encounterId,
      temperatureCelsius: temperatureCelsius ? parseFloat(temperatureCelsius.toFixed(2)) : null,
      systolicBp,
      diastolicBp,
      pulseRate,
      respiratoryRate,
      oxygenSaturation,
      weightKg: weightKg ? parseFloat(weightKg.toFixed(2)) : null,
      heightCm: heightCm ? parseFloat(heightCm.toFixed(2)) : null,
      bmi: bmi ? parseFloat(bmi.toFixed(2)) : null,
      painScore,
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
  await recordVitalsRecorded(
    encounterId,
    encounter.patientId,
    user?.id,
    "EmrVitalSign",
    vitalsRecord.id,
    null,
    {
      temperatureCelsius,
      systolicBp,
      diastolicBp,
      pulseRate,
      respiratoryRate,
      oxygenSaturation,
      weightKg,
      heightCm,
      bmi,
      painScore,
      notes
    },
    ipAddress,
    userAgent
  );

  return vitalsRecord;
}

/**
 * Get vitals records for an encounter
 */
export async function getVitalsRecords(encounterId) {
  const vitalsRecords = await prisma.emrVitalSign.findMany({
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

  return vitalsRecords;
}

/**
 * Get latest vitals record for an encounter
 */
export async function getLatestVitals(encounterId) {
  const vitalsRecord = await prisma.emrVitalSign.findFirst({
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

  return vitalsRecord;
}

/**
 * Get vitals timeline for an encounter
 */
export async function getVitalsTimeline(encounterId) {
  const vitalsRecords = await prisma.emrVitalSign.findMany({
    where: { encounterId },
    orderBy: { recordedAt: 'asc' },
    select: {
      id: true,
      temperatureCelsius: true,
      systolicBp: true,
      diastolicBp: true,
      pulseRate: true,
      respiratoryRate: true,
      oxygenSaturation: true,
      weightKg: true,
      bmi: true,
      painScore: true,
      recordedAt: true
    }
  });

  return vitalsRecords;
}
