import { followUpRepository } from "../repositories/followUp.repository.js";
import { logFollowUpRecorded } from "./credit-audit.service.js";

/**
 * Record a follow-up action for a case
 * @param {Object} params - Follow-up parameters
 * @param {string} params.caseId - Case ID
 * @param {string} params.tenantId - Tenant ID
 * @param {string} params.branchId - Branch ID
 * @param {string} params.actionType - FollowUpActionType enum value
 * @param {string} params.outcome - FollowUpOutcome enum value
 * @param {string} params.notes - Follow-up notes
 * @param {string} [params.contactPerson] - Contact person name
 * @param {string} [params.contactPhone] - Contact phone number
 * @param {string} [params.contactEmail] - Contact email
 * @param {Date} [params.nextFollowUpAt] - Next follow-up date
 * @param {string} [params.recordedById] - User ID recording the follow-up
 * @param {string} [params.ipAddress] - IP address
 * @param {string} [params.userAgent] - User agent
 * @returns {Promise<Object>} Created follow-up
 */
export async function recordFollowUp({
  caseId,
  tenantId,
  branchId,
  actionType,
  outcome,
  notes,
  contactPerson,
  contactPhone,
  contactEmail,
  nextFollowUpAt,
  recordedById,
  ipAddress,
  userAgent,
}) {
  const followUpData = {
    tenantId,
    branchId,
    caseId,
    actionType,
    outcome,
    notes,
    contactPerson: contactPerson || null,
    contactPhone: contactPhone || null,
    contactEmail: contactEmail || null,
    nextFollowUpAt: nextFollowUpAt || null,
    recordedById: recordedById || null,
  };

  const followUp = await followUpRepository.create(followUpData);

  // Log audit
  await logFollowUpRecorded({
    tenantId,
    branchId,
    caseId,
    creditAccountId: null, // Will be populated by caller if needed
    actorId: recordedById,
    followUpId: followUp.id,
    ipAddress,
    userAgent,
  });

  return followUp;
}

/**
 * Get follow-ups due today
 */
export async function getFollowUpsDueToday(tenantId, branchId) {
  return followUpRepository.findDueToday(tenantId, branchId);
}

/**
 * Get overdue follow-ups
 */
export async function getOverdueFollowUps(tenantId, branchId) {
  return followUpRepository.findOverdue(tenantId, branchId);
}

/**
 * Get follow-ups for a specific collector
 */
export async function getCollectorWorklist(tenantId, branchId, collectorId) {
  return followUpRepository.findByCollector(tenantId, branchId, collectorId);
}
