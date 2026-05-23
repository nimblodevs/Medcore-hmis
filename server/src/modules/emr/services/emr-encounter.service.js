import prisma from "../../config/database.js";
import { EmrEncounterStatus, ClinicalRecordStatus } from "@prisma/client";
import { 
  recordEncounterCreated, 
  recordEncounterUpdated, 
  recordEncounterClosed 
} from "./emr-audit.service.js";

/**
 * Create EMR encounter for a patient visit
 */
export async function createEncounter(data, user, ipAddress, userAgent) {
  const { 
    patientId, 
    visitId, 
    chiefComplaint, 
    presentingHistory, 
    assignedDoctorId, 
    assignedNurseId 
  } = data;

  // Check if encounter already exists for this visit
  const existingEncounter = await prisma.emrEncounter.findUnique({
    where: { visitId }
  });

  if (existingEncounter) {
    throw new Error("An encounter already exists for this visit");
  }

  // Verify patient exists
  const patient = await prisma.patient.findUnique({
    where: { id: patientId }
  });

  if (!patient) {
    throw new Error("Patient not found");
  }

  // Verify visit exists and is open
  const visit = await prisma.patientVisit.findUnique({
    where: { id: visitId }
  });

  if (!visit) {
    throw new Error("Visit not found");
  }

  if (visit.status === 'CANCELLED' || visit.status === 'COMPLETED') {
    throw new Error("Cannot create encounter for cancelled or completed visit");
  }

  // Create encounter in transaction
  return prisma.$transaction(async (tx) => {
    const encounter = await tx.emrEncounter.create({
      data: {
        tenantId: user.tenantId,
        branchId: user.branchId,
        patientId,
        visitId,
        chiefComplaint,
        presentingHistory,
        assignedDoctorId,
        assignedNurseId,
        status: EmrEncounterStatus.OPEN,
        createdById: user.id
      },
      include: {
        patient: {
          select: {
            firstName: true,
            lastName: true,
            hospitalNumber: true
          }
        }
      }
    });

    // Create audit log
    await recordEncounterCreated(
      tx, 
      encounter.id, 
      patientId, 
      user.id, 
      ipAddress, 
      userAgent
    );

    return encounter;
  });
}

/**
 * Get encounter by ID
 */
export async function getEncounterById(encounterId, user) {
  const encounter = await prisma.emrEncounter.findUnique({
    where: { 
      id: encounterId,
      tenantId: user.tenantId,
      branchId: user.branchId
    },
    include: {
      patient: {
        select: {
          firstName: true,
          lastName: true,
          hospitalNumber: true,
          dateOfBirth: true,
          gender: true
        }
      },
      triageRecords: {
        orderBy: { recordedAt: 'desc' },
        take: 1
      },
      vitals: {
        orderBy: { recordedAt: 'desc' },
        take: 10
      },
      notes: {
        orderBy: { createdAt: 'desc' }
      },
      diagnoses: {
        orderBy: { recordedAt: 'desc' }
      },
      orders: {
        orderBy: { createdAt: 'desc' }
      },
      prescriptions: {
        orderBy: { prescribedAt: 'desc' }
      },
      allergies: {
        where: { isActive: true },
        orderBy: { createdAt: 'desc' }
      },
      dischargeSummary: true
    }
  });

  if (!encounter) {
    throw new Error("Encounter not found");
  }

  return encounter;
}

/**
 * Get encounter by visit ID
 */
export async function getEncounterByVisitId(visitId, user) {
  return prisma.emrEncounter.findUnique({
    where: { 
      visitId,
      tenantId: user.tenantId,
      branchId: user.branchId
    },
    include: {
      patient: {
        select: {
          firstName: true,
          lastName: true,
          hospitalNumber: true
        }
      }
    }
  });
}

/**
 * List encounters with filters
 */
export async function listEncounters(filters, user, options = {}) {
  const { 
    status, 
    patientId, 
    assignedDoctorId, 
    startDate, 
    endDate,
    search 
  } = filters;

  const { limit = 50, offset = 0 } = options;

  const where = {
    tenantId: user.tenantId,
    branchId: user.branchId
  };

  if (status) {
    where.status = status;
  }

  if (patientId) {
    where.patientId = patientId;
  }

  if (assignedDoctorId) {
    where.assignedDoctorId = assignedDoctorId;
  }

  if (startDate || endDate) {
    where.startedAt = {};
    if (startDate) {
      where.startedAt.gte = new Date(startDate);
    }
    if (endDate) {
      where.startedAt.lte = new Date(endDate);
    }
  }

  if (search) {
    // Search would need to join with patient table
    // For now, we'll filter after fetching or use a more complex query
  }

  const encounters = await prisma.emrEncounter.findMany({
    where,
    include: {
      patient: {
        select: {
          firstName: true,
          lastName: true,
          hospitalNumber: true
        }
      }
    },
    orderBy: {
      startedAt: 'desc'
    },
    take: limit,
    skip: offset
  });

  const total = await prisma.emrEncounter.count({ where });

  return {
    data: encounters,
    pagination: {
      total,
      limit,
      offset,
      hasMore: offset + limit < total
    }
  };
}

/**
 * Update encounter
 */
export async function updateEncounter(encounterId, data, user, ipAddress, userAgent) {
  const { 
    chiefComplaint, 
    presentingHistory, 
    assignedDoctorId, 
    assignedNurseId,
    status 
  } = data;

  const existing = await prisma.emrEncounter.findUnique({
    where: { 
      id: encounterId,
      tenantId: user.tenantId,
      branchId: user.branchId
    }
  });

  if (!existing) {
    throw new Error("Encounter not found");
  }

  // Cannot update closed or cancelled encounters
  if (existing.status === 'CLOSED' || existing.status === 'CANCELLED') {
    throw new Error("Cannot update closed or cancelled encounters");
  }

  const previousValues = {
    chiefComplaint: existing.chiefComplaint,
    presentingHistory: existing.presentingHistory,
    assignedDoctorId: existing.assignedDoctorId,
    assignedNurseId: existing.assignedNurseId,
    status: existing.status
  };

  const updateData = {};
  if (chiefComplaint !== undefined) updateData.chiefComplaint = chiefComplaint;
  if (presentingHistory !== undefined) updateData.presentingHistory = presentingHistory;
  if (assignedDoctorId !== undefined) updateData.assignedDoctorId = assignedDoctorId;
  if (assignedNurseId !== undefined) updateData.assignedNurseId = assignedNurseId;
  if (status !== undefined) updateData.status = status;

  updateData.updatedById = user.id;

  return prisma.$transaction(async (tx) => {
    const encounter = await tx.emrEncounter.update({
      where: { id: encounterId },
      data: updateData,
      include: {
        patient: {
          select: {
            firstName: true,
            lastName: true,
            hospitalNumber: true
          }
        }
      }
    });

    // Create audit log
    await recordEncounterUpdated(
      tx,
      encounterId,
      existing.patientId,
      user.id,
      previousValues,
      updateData,
      ipAddress,
      userAgent
    );

    return encounter;
  });
}

/**
 * Close encounter
 */
export async function closeEncounter(encounterId, user, ipAddress, userAgent) {
  const existing = await prisma.emrEncounter.findUnique({
    where: { 
      id: encounterId,
      tenantId: user.tenantId,
      branchId: user.branchId
    },
    include: {
      notes: {
        where: { status: 'DRAFT' },
        select: { id: true }
      },
      diagnoses: true,
      orders: {
        where: { 
          orderStatus: { in: ['DRAFT', 'ORDERED'] },
          priority: 'STAT'
        },
        select: { id: true, priority: true }
      }
    }
  });

  if (!existing) {
    throw new Error("Encounter not found");
  }

  if (existing.status === 'CLOSED' || existing.status === 'CANCELLED') {
    throw new Error("Encounter is already closed or cancelled");
  }

  // Check for unsigned draft notes (warning only, allow override)
  const hasDraftNotes = existing.notes.length > 0;
  
  // Check for final diagnosis (recommended but not required for MVP)
  const hasFinalDiagnosis = existing.diagnoses.some(d => d.diagnosisType === 'FINAL');

  // Check for pending STAT orders
  const hasPendingStatOrders = existing.orders.length > 0;

  if (hasPendingStatOrders) {
    throw new Error("Cannot close encounter with pending STAT orders");
  }

  return prisma.$transaction(async (tx) => {
    const encounter = await tx.emrEncounter.update({
      where: { id: encounterId },
      data: {
        status: EmrEncounterStatus.CLOSED,
        closedAt: new Date(),
        updatedById: user.id
      },
      include: {
        patient: {
          select: {
            firstName: true,
            lastName: true,
            hospitalNumber: true
          }
        }
      }
    });

    // Create audit log
    await recordEncounterClosed(
      tx,
      encounterId,
      existing.patientId,
      user.id,
      ipAddress,
      userAgent
    );

    return encounter;
  });
}

/**
 * Cancel encounter
 */
export async function cancelEncounter(encounterId, reason, user, ipAddress, userAgent) {
  const existing = await prisma.emrEncounter.findUnique({
    where: { 
      id: encounterId,
      tenantId: user.tenantId,
      branchId: user.branchId
    }
  });

  if (!existing) {
    throw new Error("Encounter not found");
  }

  if (existing.status === 'CLOSED' || existing.status === 'CANCELLED') {
    throw new Error("Cannot cancel closed or already cancelled encounter");
  }

  return prisma.$transaction(async (tx) => {
    const encounter = await tx.emrEncounter.update({
      where: { id: encounterId },
      data: {
        status: EmrEncounterStatus.CANCELLED,
        cancelledAt: new Date(),
        cancellationReason: reason,
        updatedById: user.id
      },
      include: {
        patient: {
          select: {
            firstName: true,
            lastName: true,
            hospitalNumber: true
          }
        }
      }
    });

    // Create audit log
    await recordEncounterUpdated(
      tx,
      encounterId,
      existing.patientId,
      user.id,
      { status: existing.status, cancellationReason: null },
      { status: 'CANCELLED', cancellationReason: reason },
      ipAddress,
      userAgent
    );

    return encounter;
  });
}

/**
 * Get active encounters count
 */
export async function getActiveEncountersCount(user) {
  const [open, inProgress, readyForDischarge] = await Promise.all([
    prisma.emrEncounter.count({
      where: {
        tenantId: user.tenantId,
        branchId: user.branchId,
        status: EmrEncounterStatus.OPEN
      }
    }),
    prisma.emrEncounter.count({
      where: {
        tenantId: user.tenantId,
        branchId: user.branchId,
        status: EmrEncounterStatus.IN_PROGRESS
      }
    }),
    prisma.emrEncounter.count({
      where: {
        tenantId: user.tenantId,
        branchId: user.branchId,
        status: EmrEncounterStatus.READY_FOR_DISCHARGE
      }
    })
  ]);

  return {
    open,
    inProgress,
    readyForDischarge,
    total: open + inProgress + readyForDischarge
  };
}
