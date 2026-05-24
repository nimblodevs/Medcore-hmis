import { holdRepository } from "../repositories/hold.repository.js";
import { logHoldRecommended, logHoldApproved, logHoldReleased } from "./credit-audit.service.js";

/**
 * Recommend a credit hold for an account
 * @param {Object} params - Hold recommendation parameters
 * @param {string} params.caseId - Case ID
 * @param {string} params.tenantId - Tenant ID
 * @param {string} params.branchId - Branch ID
 * @param {string} params.creditAccountId - Credit account ID
 * @param {string} params.reason - Reason for the hold
 * @param {string} [params.recommendedById] - User ID recommending the hold
 * @returns {Promise<Object>} Created credit hold
 */
export async function recommendHold({
  caseId,
  tenantId,
  branchId,
  creditAccountId,
  reason,
  recommendedById,
}) {
  const holdData = {
    tenantId,
    branchId,
    caseId,
    creditAccountId,
    status: "RECOMMENDED",
    reason,
    recommendedById: recommendedById || null,
  };

  return holdRepository.create(holdData);
}

/**
 * Approve a credit hold
 * @param {Object} params - Approval parameters
 * @param {string} params.holdId - Hold ID
 * @param {string} params.tenantId - Tenant ID
 * @param {string} params.branchId - Branch ID
 * @param {string} params.approvedById - User ID approving the hold
 * @returns {Promise<Object>} Updated hold
 */
export async function approveHold({
  holdId,
  tenantId,
  branchId,
  approvedById,
}) {
  const existingHold = await holdRepository.findById(holdId);
  if (!existingHold) {
    throw new Error("Credit hold not found");
  }

  if (existingHold.status !== "RECOMMENDED") {
    throw new Error("Only recommended holds can be approved");
  }

  const updatedHold = await holdRepository.approve(holdId, approvedById);

  // Log audit
  await logHoldApproved({
    tenantId,
    branchId,
    caseId: existingHold.caseId,
    creditAccountId: existingHold.creditAccountId,
    actorId: approvedById,
    holdId,
  });

  return updatedHold;
}

/**
 * Reject a credit hold
 * @param {Object} params - Rejection parameters
 * @param {string} params.holdId - Hold ID
 * @param {string} params.tenantId - Tenant ID
 * @param {string} params.branchId - Branch ID
 * @param {string} params.rejectedById - User ID rejecting the hold
 * @param {string} params.rejectionReason - Reason for rejection
 * @returns {Promise<Object>} Updated hold
 */
export async function rejectHold({
  holdId,
  tenantId,
  branchId,
  rejectedById,
  rejectionReason,
}) {
  const existingHold = await holdRepository.findById(holdId);
  if (!existingHold) {
    throw new Error("Credit hold not found");
  }

  return holdRepository.reject(holdId, rejectedById, rejectionReason);
}

/**
 * Release a credit hold
 * @param {Object} params - Release parameters
 * @param {string} params.holdId - Hold ID
 * @param {string} params.tenantId - Tenant ID
 * @param {string} params.branchId - Branch ID
 * @param {string} params.releasedById - User ID releasing the hold
 * @param {string} [params.releaseReason] - Reason for release
 * @returns {Promise<Object>} Updated hold
 */
export async function releaseHold({
  holdId,
  tenantId,
  branchId,
  releasedById,
  releaseReason,
}) {
  const existingHold = await holdRepository.findById(holdId);
  if (!existingHold) {
    throw new Error("Credit hold not found");
  }

  const updatedHold = await holdRepository.release(holdId, releasedById, releaseReason || null);

  // Log audit
  await logHoldReleased({
    tenantId,
    branchId,
    caseId: existingHold.caseId,
    creditAccountId: existingHold.creditAccountId,
    actorId: releasedById,
    holdId,
  });

  return updatedHold;
}

/**
 * Get active holds
 */
export async function getActiveHolds(tenantId, branchId) {
  return holdRepository.findActiveHolds(tenantId, branchId);
}

/**
 * Get recommended holds pending approval
 */
export async function getRecommendedHolds(tenantId, branchId) {
  return holdRepository.findRecommendedHolds(tenantId, branchId);
}
