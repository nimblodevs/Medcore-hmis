import prisma from "../config/prisma.js";
import ApiError from "../utils/apiError.js";

const pad = (v, n = 4) => String(v).padStart(n, "0");

/**
 * Generate next sequence number for a given type within tenant/branch scope
 * Uses ReferenceSequence table for atomic incrementing
 * 
 * @param {string} tenantId - Tenant ID
 * @param {string} branchId - Branch ID  
 * @param {string} type - Sequence type (INVOICE, RECEIPT, CLAIM, etc.)
 * @returns {Promise<{sequence: number, formatted: string}>}
 */
export const getNextSequence = async (tenantId, branchId, type) => {
  if (!tenantId) throw new ApiError(400, "tenantId is required for sequence generation");
  if (!branchId) throw new ApiError(400, "branchId is required for sequence generation");
  if (!type) throw new ApiError(400, "type is required for sequence generation");

  const dateKey = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const scopeKey = `${tenantId}:${branchId}`;

  // Atomic upsert to get and increment sequence
  const sequence = await prisma.referenceSequence.upsert({
    where: {
      scopeKey_type_dateKey: {
        scopeKey,
        type,
        dateKey
      }
    },
    update: {
      lastNumber: { increment: 1 }
    },
    create: {
      scopeKey,
      type,
      dateKey,
      lastNumber: 1
    }
  });

  return {
    sequence: sequence.lastNumber,
    formatted: pad(sequence.lastNumber)
  };
};

/**
 * Generate invoice number with format: INV-{BRANCH_CODE}-{YYYYMMDD}-{SEQ}
 */
export const generateInvoiceNo = async (tenantId, branchId) => {
  const { sequence } = await getNextSequence(tenantId, branchId, "INVOICE");
  const branch = await prisma.branch.findUnique({
    where: { id: branchId },
    select: { code: true }
  });
  if (!branch) throw new ApiError(404, "Branch not found");
  
  const dateKey = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  return `INV-${branch.code}-${dateKey}-${pad(sequence)}`;
};

/**
 * Generate receipt number with format: RCP-{BRANCH_CODE}-{YYYYMMDD}-{SEQ}
 */
export const generateReceiptNo = async (tenantId, branchId) => {
  const { sequence } = await getNextSequence(tenantId, branchId, "RECEIPT");
  const branch = await prisma.branch.findUnique({
    where: { id: branchId },
    select: { code: true }
  });
  if (!branch) throw new ApiError(404, "Branch not found");
  
  const dateKey = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  return `RCP-${branch.code}-${dateKey}-${pad(sequence)}`;
};

/**
 * Generate claim number with format: CLM-{BRANCH_CODE}-{YYYYMMDD}-{SEQ}
 */
export const generateClaimNo = async (tenantId, branchId) => {
  const { sequence } = await getNextSequence(tenantId, branchId, "CLAIM");
  const branch = await prisma.branch.findUnique({
    where: { id: branchId },
    select: { code: true }
  });
  if (!branch) throw new ApiError(404, "Branch not found");
  
  const dateKey = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  return `CLM-${branch.code}-${dateKey}-${pad(sequence)}`;
};

/**
 * Generate prescription number with format: RX-{BRANCH_CODE}-{YYYYMMDD}-{SEQ}
 */
export const generatePrescriptionNo = async (tenantId, branchId) => {
  const { sequence } = await getNextSequence(tenantId, branchId, "PRESCRIPTION");
  const branch = await prisma.branch.findUnique({
    where: { id: branchId },
    select: { code: true }
  });
  if (!branch) throw new ApiError(404, "Branch not found");
  
  const dateKey = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  return `RX-${branch.code}-${dateKey}-${pad(sequence)}`;
};

/**
 * Generate statement number with format: STM-{BRANCH_CODE}-{YYYYMMDD}-{SEQ}
 */
export const generateStatementNo = async (tenantId, branchId) => {
  const { sequence } = await getNextSequence(tenantId, branchId, "STATEMENT");
  const branch = await prisma.branch.findUnique({
    where: { id: branchId },
    select: { code: true }
  });
  if (!branch) throw new ApiError(404, "Branch not found");
  
  const dateKey = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  return `STM-${branch.code}-${dateKey}-${pad(sequence)}`;
};

/**
 * Generate reversal number with format: REV-{BRANCH_CODE}-{YYYYMMDD}-{SEQ}
 */
export const generateReversalNo = async (tenantId, branchId) => {
  const { sequence } = await getNextSequence(tenantId, branchId, "REVERSAL");
  const branch = await prisma.branch.findUnique({
    where: { id: branchId },
    select: { code: true }
  });
  if (!branch) throw new ApiError(404, "Branch not found");
  
  const dateKey = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  return `REV-${branch.code}-${dateKey}-${pad(sequence)}`;
};

/**
 * Generate adjustment number with format: ADJ-{BRANCH_CODE}-{YYYYMMDD}-{SEQ}
 */
export const generateAdjustmentNo = async (tenantId, branchId) => {
  const { sequence } = await getNextSequence(tenantId, branchId, "ADJUSTMENT");
  const branch = await prisma.branch.findUnique({
    where: { id: branchId },
    select: { code: true }
  });
  if (!branch) throw new ApiError(404, "Branch not found");
  
  const dateKey = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  return `ADJ-${branch.code}-${dateKey}-${pad(sequence)}`;
};

// Legacy exports for backward compatibility
export const invoiceNo = (count) => `INV-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${pad(count + 1)}`;
export const receiptNo = (count) => `RCP-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${pad(count + 1)}`;
export const claimNo = (count) => `CLM-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${pad(count + 1)}`;
export const prescriptionNo = (count) => `RX-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${pad(count + 1)}`;
