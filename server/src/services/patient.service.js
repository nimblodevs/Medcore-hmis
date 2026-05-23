/**
 * Patient Management Service
 * Core business logic for patient registration, search, and management
 */

import prisma from "../config/database.js";
import { generateHospitalNumber } from "./patientNumber.service.js";

/**
 * Check for duplicate patients
 * Returns duplicate info if found, null otherwise
 */
async function checkForDuplicates(data, tenantId) {
  const duplicates = {
    exact: [],
    probable: []
  };
  
  // Check exact national ID duplicate
  if (data.nationalId) {
    const existingById = await prisma.patient.findFirst({
      where: {
        tenantId,
        nationalId: data.nationalId,
        deletedAt: null
      }
    });
    
    if (existingById) {
      duplicates.exact.push({
        type: 'NATIONAL_ID',
        patientId: existingById.id,
        hospitalNumber: existingById.hospitalNumber,
        name: `${existingById.firstName} ${existingById.lastName}`
      });
    }
  }
  
  // Check exact passport duplicate
  if (data.passportNumber) {
    const existingByPassport = await prisma.patient.findFirst({
      where: {
        tenantId,
        passportNumber: data.passportNumber,
        deletedAt: null
      }
    });
    
    if (existingByPassport) {
      duplicates.exact.push({
        type: 'PASSPORT',
        patientId: existingByPassport.id,
        hospitalNumber: existingByPassport.hospitalNumber,
        name: `${existingByPassport.firstName} ${existingByPassport.lastName}`
      });
    }
  }
  
  // Check probable duplicates (name + DOB)
  if (data.firstName && data.lastName && data.dateOfBirth) {
    const probableDuplicates = await prisma.patient.findMany({
      where: {
        tenantId,
        firstName: { equals: data.firstName, mode: 'insensitive' },
        lastName: { equals: data.lastName, mode: 'insensitive' },
        dateOfBirth: data.dateOfBirth,
        deletedAt: null
      },
      select: {
        id: true,
        hospitalNumber: true,
        firstName: true,
        lastName: true,
        dateOfBirth: true,
        phone: true
      }
    });
    
    if (probableDuplicates.length > 0) {
      duplicates.probable = probableDuplicates.map(p => ({
        type: 'NAME_DOB',
        patientId: p.id,
        hospitalNumber: p.hospitalNumber,
        name: `${p.firstName} ${p.lastName}`,
        dateOfBirth: p.dateOfBirth,
        phone: p.phone
      }));
    }
  }
  
  return duplicates;
}

/**
 * Create a new patient with duplicate checking
 */
export async function createPatient(data, user, tenantId, branchId) {
  // Check for duplicates
  const duplicates = await checkForDuplicates(data, tenantId);
  
  // Block on exact duplicates
  if (duplicates.exact.length > 0) {
    throw new Error(`A patient with this ${duplicates.exact[0].type.toLowerCase().replace('_', ' ')} already exists (UHID: ${duplicates.exact[0].hospitalNumber})`);
  }
  
  // Generate hospital number
  const hospitalNumber = await generateHospitalNumber();
  
  // Create patient in transaction
  return await prisma.$transaction(async (tx) => {
    const patient = await tx.patient.create({
      data: {
        tenantId,
        branchId,
        hospitalNumber,
        firstName: data.firstName,
        middleName: data.middleName || null,
        lastName: data.lastName,
        gender: data.gender || 'UNKNOWN',
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
        maritalStatus: data.maritalStatus || 'UNKNOWN',
        nationalId: data.nationalId || null,
        passportNumber: data.passportNumber || null,
        phone: data.phone || null,
        alternativePhone: data.alternativePhone || null,
        email: data.email || null,
        address: data.address || null,
        county: data.county || null,
        city: data.city || null,
        status: 'ACTIVE',
        createdById: user?.id || null
      },
      include: {
        contacts: true,
        payerProfiles: true
      }
    });
    
    // Create audit log
    await tx.patientAuditLog.create({
      data: {
        tenantId,
        branchId,
        patientId: patient.id,
        actorId: user?.id || null,
        action: 'PATIENT_CREATED',
        entityType: 'Patient',
        entityId: patient.id,
        newValues: {
          hospitalNumber: patient.hospitalNumber,
          name: `${patient.firstName} ${patient.lastName}`
        }
      }
    });
    
    return { patient, duplicates: { probable: duplicates.probable } };
  });
}

/**
 * Get patient by ID
 */
export async function getPatientById(id, tenantId) {
  return await prisma.patient.findUnique({
    where: {
      id,
      tenantId,
      deletedAt: null
    },
    include: {
      contacts: {
        where: { deletedAt: null },
        orderBy: { isPrimary: 'desc' }
      },
      payerProfiles: {
        where: { 
          deletedAt: null,
          isActive: true
        },
        orderBy: { isDefault: 'desc' }
      },
      alerts: {
        where: { 
          deletedAt: null,
          isActive: true
        },
        orderBy: { createdAt: 'desc' }
      },
      visits: {
        where: { deletedAt: null },
        orderBy: { createdAt: 'desc' },
        take: 10
      },
      documents: {
        where: { deletedAt: null },
        orderBy: { uploadedAt: 'desc' },
        take: 10
      }
    }
  });
}

/**
 * Get patient by hospital number (UHID)
 */
export async function getPatientByHospitalNumber(hospitalNumber, tenantId) {
  return await prisma.patient.findUnique({
    where: {
      tenantId,
      hospitalNumber,
      deletedAt: null
    },
    include: {
      contacts: { where: { deletedAt: null } },
      payerProfiles: { where: { deletedAt: null, isActive: true } },
      alerts: { where: { deletedAt: null, isActive: true } }
    }
  });
}

/**
 * Search patients
 */
export async function searchPatients(query, tenantId, branchId, page = 1, limit = 20) {
  const searchTerm = query.trim();
  
  if (!searchTerm) {
    return { patients: [], total: 0, page, totalPages: 0 };
  }
  
  const skip = (page - 1) * limit;
  
  // Build search conditions
  const where = {
    tenantId,
    branchId,
    deletedAt: null,
    OR: [
      { hospitalNumber: { contains: searchTerm, mode: 'insensitive' } },
      { firstName: { contains: searchTerm, mode: 'insensitive' } },
      { lastName: { contains: searchTerm, mode: 'insensitive' } },
      { phone: { contains: searchTerm.replace(/\s/g, '') } },
      { nationalId: { contains: searchTerm } },
      { passportNumber: { contains: searchTerm } }
    ]
  };
  
  const [patients, total] = await Promise.all([
    prisma.patient.findMany({
      where,
      select: {
        id: true,
        hospitalNumber: true,
        firstName: true,
        lastName: true,
        middleName: true,
        gender: true,
        dateOfBirth: true,
        phone: true,
        email: true,
        status: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    }),
    prisma.patient.count({ where })
  ]);
  
  return {
    patients,
    total,
    page,
    totalPages: Math.ceil(total / limit)
  };
}

/**
 * Update patient
 */
export async function updatePatient(id, data, user, tenantId) {
  return await prisma.$transaction(async (tx) => {
    // Get current patient
    const currentPatient = await tx.patient.findUnique({
      where: { id, tenantId, deletedAt: null }
    });
    
    if (!currentPatient) {
      throw new Error('Patient not found');
    }
    
    // Check for duplicates if ID numbers changed
    if (data.nationalId && data.nationalId !== currentPatient.nationalId) {
      const existingById = await tx.patient.findFirst({
        where: {
          tenantId,
          nationalId: data.nationalId,
          id: { not: id },
          deletedAt: null
        }
      });
      
      if (existingById) {
        throw new Error(`Another patient already has this national ID (UHID: ${existingById.hospitalNumber})`);
      }
    }
    
    const updatedPatient = await tx.patient.update({
      where: { id, tenantId },
      data: {
        ...data,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
        updatedById: user?.id || null
      },
      include: {
        contacts: { where: { deletedAt: null } },
        payerProfiles: { where: { deletedAt: null, isActive: true } }
      }
    });
    
    // Create audit log
    await tx.patientAuditLog.create({
      data: {
        tenantId,
        branchId: currentPatient.branchId,
        patientId: id,
        actorId: user?.id || null,
        action: 'PATIENT_UPDATED',
        entityType: 'Patient',
        entityId: id,
        previousValues: {
          name: `${currentPatient.firstName} ${currentPatient.lastName}`,
          phone: currentPatient.phone
        },
        newValues: {
          name: `${updatedPatient.firstName} ${updatedPatient.lastName}`,
          phone: updatedPatient.phone
        }
      }
    });
    
    return updatedPatient;
  });
}

/**
 * Change patient status
 */
export async function changePatientStatus(id, status, reason, user, tenantId) {
  return await prisma.$transaction(async (tx) => {
    const patient = await tx.patient.update({
      where: { id, tenantId, deletedAt: null },
      data: { status }
    });
    
    await tx.patientAuditLog.create({
      data: {
        tenantId,
        patientId: id,
        actorId: user?.id || null,
        action: 'PATIENT_STATUS_CHANGED',
        entityType: 'Patient',
        entityId: id,
        newValues: { status, reason }
      }
    });
    
    return patient;
  });
}

/**
 * Get active visits for a patient
 */
export async function getActiveVisits(patientId, tenantId) {
  return await prisma.patientVisit.findMany({
    where: {
      patientId,
      tenantId,
      status: { in: ['OPEN', 'IN_PROGRESS'] },
      deletedAt: null
    },
    orderBy: { createdAt: 'desc' }
  });
}

export default {
  createPatient,
  getPatientById,
  getPatientByHospitalNumber,
  searchPatients,
  updatePatient,
  changePatientStatus,
  getActiveVisits
};
