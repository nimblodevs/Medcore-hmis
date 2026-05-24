import { disputeRepository } from "../repositories/dispute.repository.js";
import { logDisputeCreated, logDisputeResolved } from "./credit-audit.service.js";

/**
 * Create a credit dispute
 * @param {Object} params - Dispute parameters
 * @param {string} params.caseId - Case ID
 * @param {string} params.tenantId - Tenant ID
 * @param {string} params.branchId - Branch ID
 * @param {string} params.creditAccountId - Credit account ID
 * @param {string} params.disputeReason - Reason for the dispute
 * @param {number} [params.disputedAmount] - Amount being disputed (optional, defaults to full balance)
 * @param {string} [params.invoiceId] - Invoice ID being disputed
 * @param {string} [params.openedById] - User ID opening the dispute
 * @returns {Promise<Object>} Created dispute
 */
export async function createDispute({
  caseId,
  tenantId,
  branchId,
  creditAccountId,
  disputeReason,
  disputedAmount,
  invoiceId,
  openedById,
}) {
  const disputeData = {
    tenantId,
    branchId,
    caseId,
    creditAccountId,
    invoiceId: invoiceId || null,
    status: "OPEN",
    disputeReason,
    disputedAmount: disputedAmount || null,
    openedById: openedById || null,
  };

  return disputeRepository.create(disputeData);
}

/**
 * Resolve a credit dispute
 * @param {Object} params - Resolution parameters
 * @param {string} params.disputeId - Dispute ID
 * @param {string} params.tenantId - Tenant ID
 * @param {string} params.branchId - Branch ID
 * @param {string} params.resolutionNotes - Resolution notes
 * @param {string} [params.resolvedById] - User ID resolving the dispute
 * @param {string} [params.status] - Resolution status (ACCEPTED, REJECTED, RESOLVED)
 * @returns {Promise<Object>} Updated dispute
 */
export async function resolveDispute({
  disputeId,
  tenantId,
  branchId,
  resolutionNotes,
  resolvedById,
  status = "RESOLVED",
}) {
  const existingDispute = await disputeRepository.findById(disputeId);
  if (!existingDispute) {
    throw new Error("Credit dispute not found");
  }

  const updatedDispute = await disputeRepository.resolve(
    disputeId,
    resolvedById,
    resolutionNotes,
    status
  );

  // Log audit
  await logDisputeResolved({
    tenantId,
    branchId,
    caseId: existingDispute.caseId,
    creditAccountId: existingDispute.creditAccountId,
    actorId: resolvedById,
    disputeId,
  });

  return updatedDispute;
}

/**
 * Cancel a credit dispute
 * @param {Object} params - Cancellation parameters
 * @param {string} params.disputeId - Dispute ID
 * @param {string} params.tenantId - Tenant ID
 * @param {string} params.branchId - Branch ID
 * @param {string} [params.resolvedById] - User ID cancelling the dispute
 * @param {string} [params.resolutionNotes] - Notes for cancellation
 * @returns {Promise<Object>} Updated dispute
 */
export async function cancelDispute({
  disputeId,
  tenantId,
  branchId,
  resolvedById,
  resolutionNotes,
}) {
  const existingDispute = await disputeRepository.findById(disputeId);
  if (!existingDispute) {
    throw new Error("Credit dispute not found");
  }

  return disputeRepository.cancel(disputeId, resolvedById, resolutionNotes || null);
}

/**
 * Get open disputes
 */
export async function getOpenDisputes(tenantId, branchId) {
  return disputeRepository.findOpenDisputes(tenantId, branchId);
}
