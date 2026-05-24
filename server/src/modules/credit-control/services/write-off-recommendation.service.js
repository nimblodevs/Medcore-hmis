import { writeOffRepository } from "../repositories/writeOff.repository.js";
import { logWriteOffRecommended, logWriteOffApproved } from "./credit-audit.service.js";

/**
 * Recommend a write-off for an invoice/account
 * @param {Object} params - Write-off recommendation parameters
 * @param {string} params.caseId - Case ID
 * @param {string} params.tenantId - Tenant ID
 * @param {string} params.branchId - Branch ID
 * @param {string} params.creditAccountId - Credit account ID
 * @param {number} params.amount - Amount to write off
 * @param {string} params.reason - Reason for write-off
 * @param {string} [params.invoiceId] - Invoice ID being written off
 * @param {string} [params.recommendedById] - User ID recommending the write-off
 * @returns {Promise<Object>} Created write-off recommendation
 */
export async function recommendWriteOff({
  caseId,
  tenantId,
  branchId,
  creditAccountId,
  amount,
  reason,
  invoiceId,
  recommendedById,
}) {
  const writeOffData = {
    tenantId,
    branchId,
    caseId,
    creditAccountId,
    invoiceId: invoiceId || null,
    amount,
    reason,
    status: "PENDING",
    recommendedById: recommendedById || null,
  };

  return writeOffRepository.create(writeOffData);
}

/**
 * Approve a write-off recommendation
 * @param {Object} params - Approval parameters
 * @param {string} params.writeOffId - Write-off ID
 * @param {string} params.tenantId - Tenant ID
 * @param {string} params.branchId - Branch ID
 * @param {string} params.approvedById - User ID approving the write-off
 * @returns {Promise<Object>} Updated write-off
 */
export async function approveWriteOff({
  writeOffId,
  tenantId,
  branchId,
  approvedById,
}) {
  const existingWriteOff = await writeOffRepository.findById(writeOffId);
  if (!existingWriteOff) {
    throw new Error("Write-off recommendation not found");
  }

  if (existingWriteOff.status !== "PENDING") {
    throw new Error("Only pending write-offs can be approved");
  }

  const updatedWriteOff = await writeOffRepository.approve(writeOffId, approvedById);

  // Log audit
  await logWriteOffApproved({
    tenantId,
    branchId,
    caseId: existingWriteOff.caseId,
    creditAccountId: existingWriteOff.creditAccountId,
    actorId: approvedById,
    writeOffId,
  });

  return updatedWriteOff;
}

/**
 * Reject a write-off recommendation
 * @param {Object} params - Rejection parameters
 * @param {string} params.writeOffId - Write-off ID
 * @param {string} params.tenantId - Tenant ID
 * @param {string} params.branchId - Branch ID
 * @param {string} params.rejectedById - User ID rejecting the write-off
 * @param {string} params.rejectionReason - Reason for rejection
 * @returns {Promise<Object>} Updated write-off
 */
export async function rejectWriteOff({
  writeOffId,
  tenantId,
  branchId,
  rejectedById,
  rejectionReason,
}) {
  const existingWriteOff = await writeOffRepository.findById(writeOffId);
  if (!existingWriteOff) {
    throw new Error("Write-off recommendation not found");
  }

  return writeOffRepository.reject(writeOffId, rejectedById, rejectionReason);
}

/**
 * Mark a write-off as posted (after adjustment is created in accounting module)
 * @param {Object} params - Posting parameters
 * @param {string} params.writeOffId - Write-off ID
 * @param {string} params.tenantId - Tenant ID
 * @param {string} params.branchId - Branch ID
 * @param {string} params.postedAdjustmentId - Adjustment ID created in accounting module
 * @returns {Promise<Object>} Updated write-off
 */
export async function postWriteOff({
  writeOffId,
  tenantId,
  branchId,
  postedAdjustmentId,
}) {
  const existingWriteOff = await writeOffRepository.findById(writeOffId);
  if (!existingWriteOff) {
    throw new Error("Write-off recommendation not found");
  }

  if (existingWriteOff.status !== "APPROVED") {
    throw new Error("Only approved write-offs can be posted");
  }

  return writeOffRepository.markPosted(writeOffId, postedAdjustmentId);
}

/**
 * Get pending write-off recommendations
 */
export async function getPendingWriteOffs(tenantId, branchId) {
  return writeOffRepository.findPendingRecommendations(tenantId, branchId);
}

/**
 * Get approved and posted write-offs
 */
export async function getApprovedWriteOffs(tenantId, branchId) {
  return writeOffRepository.findApprovedWriteOffs(tenantId, branchId);
}
