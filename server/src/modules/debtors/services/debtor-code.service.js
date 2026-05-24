import prisma from "../../../config/database.js";

/**
 * Generate a unique debtor code based on debtor type
 * Format: {TYPE_PREFIX}-{SEQUENTIAL_NUMBER}
 * Examples: INS-000001, CORP-000001, DCORP-000001, SHA-000001
 */
const TYPE_PREFIXES = {
  INSURANCE: "INS",
  CORPORATE: "CORP",
  DIRECT_CORPORATE: "DCORP",
  SHA: "SHA",
  NGO: "NGO",
  EMBASSY: "EMB",
  GOVERNMENT: "GOV",
  OTHER: "OTH"
};

export async function generateDebtorCode(debtorType) {
  const prefix = TYPE_PREFIXES[debtorType] || "OTH";
  
  // Find the highest existing sequence number for this type
  const lastAccount = await prisma.debtorAccount.findFirst({
    where: {
      debtorCode: {
        startsWith: `${prefix}-`
      }
    },
    orderBy: {
      debtorCode: 'desc'
    }
  });

  let nextNumber = 1;
  
  if (lastAccount && lastAccount.debtorCode) {
    // Extract the number part from the last code
    const lastNumber = parseInt(lastAccount.debtorCode.split('-')[1], 10);
    if (!isNaN(lastNumber)) {
      nextNumber = lastNumber + 1;
    }
  }

  // Pad the number to 6 digits
  const paddedNumber = String(nextNumber).padStart(6, '0');
  
  return `${prefix}-${paddedNumber}`;
}

/**
 * Check if a debtor code already exists
 */
export async function isDebtorCodeUnique(debtorCode) {
  const existing = await prisma.debtorAccount.findUnique({
    where: { debtorCode }
  });
  return !existing;
}

/**
 * Check if a debtor name with same type already exists (for duplicate detection)
 */
export async function findDuplicateDebtor(debtorName, debtorType, excludeId = null) {
  const where = {
    debtorName: debtorName.trim(),
    debtorType: debtorType
  };

  if (excludeId) {
    where.id = { not: excludeId };
  }

  const existing = await prisma.debtorAccount.findFirst({ where });
  return existing;
}

export default {
  generateDebtorCode,
  isDebtorCodeUnique,
  findDuplicateDebtor
};
