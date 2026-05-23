import prisma from "../../config/database.js";
import { OrderStatus } from "@prisma/client";
import { 
  recordPrescriptionCreated, 
  recordPrescriptionCancelled 
} from "./emr-audit.service.js";

/**
 * Create a prescription for an encounter
 */
export async function createPrescription(encounterId, data, user, ipAddress, userAgent) {
  const {
    medicationName,
    genericName,
    dosage,
    frequency,
    duration,
    route,
    quantity,
    instructions
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
    throw new Error("Cannot create prescription for closed or cancelled encounter");
  }

  // Create prescription
  const prescription = await prisma.emrPrescription.create({
    data: {
      encounterId,
      medicationName,
      genericName,
      dosage,
      frequency,
      duration,
      route,
      quantity,
      instructions,
      status: OrderStatus.ORDERED,
      prescribedById: user?.id
    },
    include: {
      encounter: {
        include: {
          patient: true
        }
      },
      prescribedBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true
        }
      }
    }
  });

  // Audit log
  await recordPrescriptionCreated(
    encounterId,
    encounter.patientId,
    user?.id,
    "EmrPrescription",
    prescription.id,
    null,
    {
      medicationName,
      genericName,
      dosage,
      frequency,
      duration,
      route,
      quantity,
      instructions
    },
    ipAddress,
    userAgent
  );

  return prescription;
}

/**
 * Get prescriptions for an encounter
 */
export async function getPrescriptions(encounterId) {
  const prescriptions = await prisma.emrPrescription.findMany({
    where: { encounterId },
    orderBy: { prescribedAt: 'desc' },
    include: {
      prescribedBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true
        }
      },
      cancelledBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true
        }
      }
    }
  });

  return prescriptions;
}

/**
 * Get a specific prescription
 */
export async function getPrescription(prescriptionId) {
  const prescription = await prisma.emrPrescription.findUnique({
    where: { id: prescriptionId },
    include: {
      encounter: {
        include: {
          patient: true
        }
      },
      prescribedBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true
        }
      },
      cancelledBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true
        }
      }
    }
  });

  if (!prescription) {
    throw new Error("Prescription not found");
  }

  return prescription;
}

/**
 * Cancel a prescription
 */
export async function cancelPrescription(prescriptionId, reason, user, ipAddress, userAgent) {
  const prescription = await prisma.emrPrescription.findUnique({
    where: { id: prescriptionId },
    include: {
      encounter: {
        include: {
          patient: true
        }
      }
    }
  });

  if (!prescription) {
    throw new Error("Prescription not found");
  }

  if (prescription.status === OrderStatus.CANCELLED) {
    throw new Error("Prescription is already cancelled");
  }

  // Check if prescription has been dispensed
  // For MVP, we check if pharmacySaleId exists
  if (prescription.pharmacySaleId) {
    throw new Error("Cannot cancel prescription that has been dispensed");
  }

  const previousValues = { 
    status: prescription.status,
    prescribedAt: prescription.prescribedAt
  };

  // Cancel the prescription
  const cancelledPrescription = await prisma.emrPrescription.update({
    where: { id: prescriptionId },
    data: {
      status: OrderStatus.CANCELLED,
      cancelledById: user?.id,
      cancelledAt: new Date(),
      cancellationReason: reason
    }
  });

  // Audit log
  await recordPrescriptionCancelled(
    prescription.encounterId,
    prescription.patientId,
    user?.id,
    "EmrPrescription",
    prescriptionId,
    previousValues,
    { 
      status: OrderStatus.CANCELLED,
      cancelledById: user?.id,
      cancellationReason: reason
    },
    ipAddress,
    userAgent
  );

  return cancelledPrescription;
}

/**
 * Send prescription to pharmacy module
 */
export async function sendToPharmacy(prescriptionId, user, ipAddress, userAgent) {
  const prescription = await prisma.emrPrescription.findUnique({
    where: { id: prescriptionId },
    include: {
      encounter: {
        include: {
          patient: true
        }
      }
    }
  });

  if (!prescription) {
    throw new Error("Prescription not found");
  }

  if (prescription.status === OrderStatus.CANCELLED) {
    throw new Error("Cannot send cancelled prescription to pharmacy");
  }

  // TODO: Integrate with Pharmacy module
  // This would create a pharmacy sale draft or prescription record
  // For now, we just mark it as sent
  
  // In production, you would:
  // 1. Call pharmacy service to create a sale/prescription
  // 2. Store the pharmacySaleId in the prescription
  // 3. Handle errors if pharmacy module is unavailable

  // Mock integration for now
  console.log(`Sending prescription ${prescriptionId} to pharmacy module`);
  console.log(`Patient: ${prescription.encounter.patient.hospitalNumber}`);
  console.log(`Medication: ${prescription.medicationName}`);

  return {
    ...prescription,
    sentToPharmacy: true,
    sentAt: new Date()
  };
}

/**
 * Link prescription to pharmacy sale (called by pharmacy module)
 */
export async function linkToPharmacySale(prescriptionId, pharmacySaleId) {
  const prescription = await prisma.emrPrescription.findUnique({
    where: { id: prescriptionId }
  });

  if (!prescription) {
    throw new Error("Prescription not found");
  }

  if (prescription.pharmacySaleId) {
    throw new Error("Prescription already linked to a pharmacy sale");
  }

  const updatedPrescription = await prisma.emrPrescription.update({
    where: { id: prescriptionId },
    data: { pharmacySaleId }
  });

  return updatedPrescription;
}

/**
 * Get active prescriptions for a patient across all encounters
 */
export async function getPatientActivePrescriptions(patientId) {
  const prescriptions = await prisma.emrPrescription.findMany({
    where: {
      encounter: {
        patientId
      },
      status: {
        not: OrderStatus.CANCELLED
      }
    },
    orderBy: { prescribedAt: 'desc' },
    include: {
      encounter: {
        select: {
          id: true,
          visitNumber: true,
          status: true
        }
      },
      prescribedBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true
        }
      }
    }
  });

  return prescriptions;
}
