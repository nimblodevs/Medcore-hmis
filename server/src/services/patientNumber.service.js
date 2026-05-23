/**
 * Patient Number (UHID) Generator Service
 * Generates unique hospital numbers in format: HSP2026000001
 */

import prisma from "../config/database.js";

const HOSPITAL_PREFIX = "HSP";

/**
 * Generate a new unique hospital number
 * Format: HSP + YYYY + 6-digit sequence
 * Example: HSP2026000001
 */
export async function generateHospitalNumber() {
  const year = new Date().getFullYear();
  const yearPrefix = `${HOSPITAL_PREFIX}${year}`;
  
  // Find the highest existing number for this year
  const latestPatient = await prisma.patient.findFirst({
    where: {
      hospitalNumber: {
        startsWith: yearPrefix
      }
    },
    orderBy: {
      hospitalNumber: 'desc'
    },
    select: {
      hospitalNumber: true
    }
  });
  
  let nextSequence = 1;
  
  if (latestPatient && latestPatient.hospitalNumber) {
    // Extract the numeric part
    const existingNumber = latestPatient.hospitalNumber.replace(yearPrefix, '');
    const existingSeq = parseInt(existingNumber, 10);
    
    if (!isNaN(existingSeq)) {
      nextSequence = existingSeq + 1;
    }
  }
  
  // Pad to 6 digits
  const paddedSequence = String(nextSequence).padStart(6, '0');
  
  return `${yearPrefix}${paddedSequence}`;
}

/**
 * Validate hospital number format
 */
export function isValidHospitalNumber(hospitalNumber) {
  const regex = /^HSP\d{10}$/;
  return regex.test(hospitalNumber);
}

/**
 * Parse hospital number to extract year and sequence
 */
export function parseHospitalNumber(hospitalNumber) {
  if (!isValidHospitalNumber(hospitalNumber)) {
    return null;
  }
  
  const year = parseInt(hospitalNumber.substring(3, 7), 10);
  const sequence = parseInt(hospitalNumber.substring(7), 10);
  
  return { year, sequence };
}

export default {
  generateHospitalNumber,
  isValidHospitalNumber,
  parseHospitalNumber
};
