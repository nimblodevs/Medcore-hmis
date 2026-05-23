import prisma from "../../config/database.js";
import { ClinicalRecordStatus, EmrEncounterStatus } from "@prisma/client";
import { 
  recordDischargeSummaryCreated, 
  recordDischargeSummarySigned 
} from "./emr-audit.service.js";

/**
 * Create or update a discharge summary for an encounter
 */
export async function createDischargeSummary(encounterId, data, user, ipAddress, userAgent) {
  const {
    finalDiagnosis,
    treatmentGiven,
    proceduresDone,
    dischargeCondition,
    dischargeMedications,
    followUpInstructions
  } = data;

  // Verify encounter exists
  const encounter = await prisma.emrEncounter.findUnique({
    where: { id: encounterId },
    include: { patient: true }
  });

  if (!encounter) {
    throw new Error("Encounter not found");
  }

  if (encounter.status === 'CLOSED' || encounter.status === 'CANCELLED') {
    throw new Error("Cannot create discharge summary for closed or cancelled encounter");
  }

  // Check if discharge summary already exists
  const existingSummary = await prisma.emrDischargeSummary.findUnique({
    where: { encounterId }
  });

  let dischargeSummary;

  if (existingSummary) {
    // Update existing summary
    const previousValues = {
      finalDiagnosis: existingSummary.finalDiagnosis,
      treatmentGiven: existingSummary.treatmentGiven,
      proceduresDone: existingSummary.proceduresDone,
      dischargeCondition: existingSummary.dischargeCondition,
      dischargeMedications: existingSummary.dischargeMedications,
      followUpInstructions: existingSummary.followUpInstructions
    };

    dischargeSummary = await prisma.emrDischargeSummary.update({
      where: { encounterId },
      data: {
        finalDiagnosis,
        treatmentGiven,
        proceduresDone,
        dischargeCondition,
        dischargeMedications,
        followUpInstructions,
        updatedById: user?.id
      }
    });

    // Audit log
    await recordDischargeSummaryCreated(
      encounterId,
      encounter.patientId,
      user?.id,
      "EmrDischargeSummary",
      dischargeSummary.id,
      previousValues,
      {
        finalDiagnosis,
        treatmentGiven,
        proceduresDone,
        dischargeCondition,
        dischargeMedications,
        followUpInstructions
      },
      ipAddress,
      userAgent
    );
  } else {
    // Create new summary
    dischargeSummary = await prisma.emrDischargeSummary.create({
      data: {
        encounterId,
        finalDiagnosis,
        treatmentGiven,
        proceduresDone,
        dischargeCondition,
        dischargeMedications,
        followUpInstructions,
        status: ClinicalRecordStatus.DRAFT,
        createdById: user?.id
      }
    });

    // Audit log
    await recordDischargeSummaryCreated(
      encounterId,
      encounter.patientId,
      user?.id,
      "EmrDischargeSummary",
      dischargeSummary.id,
      null,
      {
        finalDiagnosis,
        treatmentGiven,
        proceduresDone,
        dischargeCondition,
        dischargeMedications,
        followUpInstructions
      },
      ipAddress,
      userAgent
    );
  }

  return dischargeSummary;
}

/**
 * Get discharge summary for an encounter
 */
export async function getDischargeSummary(encounterId) {
  const summary = await prisma.emrDischargeSummary.findUnique({
    where: { encounterId },
    include: {
      encounter: {
        include: {
          patient: true
        }
      },
      createdBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true
        }
      },
      signedBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true
        }
      }
    }
  });

  return summary;
}

/**
 * Sign a discharge summary
 */
export async function signDischargeSummary(encounterId, user, ipAddress, userAgent) {
  const summary = await prisma.emrDischargeSummary.findUnique({
    where: { encounterId },
    include: {
      encounter: {
        include: {
          patient: true
        }
      }
    }
  });

  if (!summary) {
    throw new Error("Discharge summary not found");
  }

  if (summary.status === ClinicalRecordStatus.SIGNED) {
    throw new Error("Discharge summary is already signed");
  }

  if (summary.status === ClinicalRecordStatus.VOIDED) {
    throw new Error("Cannot sign a voided discharge summary");
  }

  // Validate required fields before signing
  if (!summary.finalDiagnosis) {
    throw new Error("Final diagnosis is required before signing discharge summary");
  }

  const previousValues = { status: summary.status };

  // Sign the summary
  const signedSummary = await prisma.emrDischargeSummary.update({
    where: { id: summary.id },
    data: {
      status: ClinicalRecordStatus.SIGNED,
      signedById: user?.id,
      signedAt: new Date(),
      updatedById: user?.id
    }
  });

  // Audit log
  await recordDischargeSummarySigned(
    encounterId,
    encounter.patientId,
    user?.id,
    "EmrDischargeSummary",
    summary.id,
    previousValues,
    { 
      status: ClinicalRecordStatus.SIGNED,
      signedById: user?.id
    },
    ipAddress,
    userAgent
  );

  return signedSummary;
}

/**
 * Update discharge summary (draft only)
 */
export async function updateDischargeSummary(summaryId, data, user, ipAddress, userAgent) {
  const summary = await prisma.emrDischargeSummary.findUnique({
    where: { id: summaryId },
    include: {
      encounter: {
        include: {
          patient: true
        }
      }
    }
  });

  if (!summary) {
    throw new Error("Discharge summary not found");
  }

  if (summary.status !== ClinicalRecordStatus.DRAFT) {
    throw new Error("Only draft discharge summaries can be updated. Signed summaries cannot be modified.");
  }

  const previousValues = {
    finalDiagnosis: summary.finalDiagnosis,
    treatmentGiven: summary.treatmentGiven,
    proceduresDone: summary.proceduresDone,
    dischargeCondition: summary.dischargeCondition,
    dischargeMedications: summary.dischargeMedications,
    followUpInstructions: summary.followUpInstructions
  };

  const updatedSummary = await prisma.emrDischargeSummary.update({
    where: { id: summaryId },
    data: {
      ...data,
      updatedById: user?.id
    }
  });

  // Audit log
  await recordDischargeSummaryCreated(
    summary.encounterId,
    summary.patientId,
    user?.id,
    "EmrDischargeSummary",
    summaryId,
    previousValues,
    data,
    ipAddress,
    userAgent
  );

  return updatedSummary;
}

/**
 * Check if encounter is ready for discharge
 */
export async function isEncounterReadyForDischarge(encounterId) {
  const encounter = await prisma.emrEncounter.findUnique({
    where: { id: encounterId },
    include: {
      diagnoses: true,
      notes: true,
      orders: true,
      dischargeSummary: true
    }
  });

  if (!encounter) {
    throw new Error("Encounter not found");
  }

  const issues = [];

  // Check for at least one final diagnosis
  const hasFinalDiagnosis = encounter.diagnoses.some(d => d.diagnosisType === 'FINAL');
  if (!hasFinalDiagnosis) {
    issues.push("No final diagnosis recorded");
  }

  // Check for at least one signed note
  const hasSignedNote = encounter.notes.some(n => n.status === 'SIGNED');
  if (!hasSignedNote) {
    issues.push("No signed clinical note");
  }

  // Check for pending STAT orders
  const pendingStatOrders = encounter.orders.filter(
    o => o.orderStatus === 'ORDERED' || o.orderStatus === 'IN_PROGRESS'
  ).filter(o => o.priority === 'STAT');
  
  if (pendingStatOrders.length > 0) {
    issues.push(`${pendingStatOrders.length} STAT order(s) pending`);
  }

  // Check for signed discharge summary
  if (!encounter.dischargeSummary || encounter.dischargeSummary.status !== 'SIGNED') {
    issues.push("Discharge summary not signed");
  }

  return {
    ready: issues.length === 0,
    issues
  };
}
