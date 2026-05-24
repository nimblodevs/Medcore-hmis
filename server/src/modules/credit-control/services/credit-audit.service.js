import { auditRepository } from "../repositories/audit.repository.js";

/**
 * Create an audit log entry for credit control actions
 * @param {Object} params - Audit log parameters
 * @param {string} params.tenantId - Tenant ID
 * @param {string} params.branchId - Branch ID
 * @param {string} [params.caseId] - Credit control case ID
 * @param {string} [params.creditAccountId] - Credit account ID
 * @param {string} [params.actorId] - User ID who performed the action
 * @param {string} params.action - CreditControlAuditAction enum value
 * @param {string} params.entityType - Type of entity being audited
 * @param {string} params.entityId - ID of the entity being audited
 * @param {Object} [params.previousValues] - Previous state of the entity
 * @param {Object} [params.newValues] - New state of the entity
 * @param {string} [params.reason] - Reason for the action
 * @param {string} [params.ipAddress] - IP address of the actor
 * @param {string} [params.userAgent] - User agent string
 * @returns {Promise<Object>} Created audit log entry
 */
export async function createAuditLog({
  tenantId,
  branchId,
  caseId,
  creditAccountId,
  actorId,
  action,
  entityType,
  entityId,
  previousValues,
  newValues,
  reason,
  ipAddress,
  userAgent,
}) {
  return auditRepository.create({
    tenantId,
    branchId,
    caseId: caseId || null,
    creditAccountId: creditAccountId || null,
    actorId: actorId || null,
    action,
    entityType,
    entityId,
    previousValues: previousValues || null,
    newValues: newValues || null,
    reason: reason || null,
    ipAddress: ipAddress || null,
    userAgent: userAgent || null,
  });
}

/**
 * Log case creation
 */
export async function logCaseCreated({ tenantId, branchId, caseId, creditAccountId, actorId, ipAddress, userAgent }) {
  return createAuditLog({
    tenantId,
    branchId,
    caseId,
    creditAccountId,
    actorId,
    action: "CASE_CREATED",
    entityType: "CreditControlCase",
    entityId: caseId,
    ipAddress,
    userAgent,
  });
}

/**
 * Log case update
 */
export async function logCaseUpdated({ tenantId, branchId, caseId, creditAccountId, actorId, previousValues, newValues, reason, ipAddress, userAgent }) {
  return createAuditLog({
    tenantId,
    branchId,
    caseId,
    creditAccountId,
    actorId,
    action: "CASE_UPDATED",
    entityType: "CreditControlCase",
    entityId: caseId,
    previousValues,
    newValues,
    reason,
    ipAddress,
    userAgent,
  });
}

/**
 * Log case assignment
 */
export async function logCaseAssigned({ tenantId, branchId, caseId, creditAccountId, actorId, assignedCollectorId, ipAddress, userAgent }) {
  return createAuditLog({
    tenantId,
    branchId,
    caseId,
    creditAccountId,
    actorId,
    action: "CASE_ASSIGNED",
    entityType: "CreditControlCase",
    entityId: caseId,
    newValues: { assignedCollectorId },
    ipAddress,
    userAgent,
  });
}

/**
 * Log follow-up recorded
 */
export async function logFollowUpRecorded({ tenantId, branchId, caseId, creditAccountId, actorId, followUpId, ipAddress, userAgent }) {
  return createAuditLog({
    tenantId,
    branchId,
    caseId,
    creditAccountId,
    actorId,
    action: "FOLLOW_UP_RECORDED",
    entityType: "CreditControlFollowUp",
    entityId: followUpId,
    ipAddress,
    userAgent,
  });
}

/**
 * Log promise to pay created
 */
export async function logPromiseCreated({ tenantId, branchId, caseId, creditAccountId, actorId, promiseId, ipAddress, userAgent }) {
  return createAuditLog({
    tenantId,
    branchId,
    caseId,
    creditAccountId,
    actorId,
    action: "PROMISE_TO_PAY_CREATED",
    entityType: "PromiseToPay",
    entityId: promiseId,
    ipAddress,
    userAgent,
  });
}

/**
 * Log promise to pay updated
 */
export async function logPromiseUpdated({ tenantId, branchId, caseId, creditAccountId, actorId, promiseId, previousValues, newValues, ipAddress, userAgent }) {
  return createAuditLog({
    tenantId,
    branchId,
    caseId,
    creditAccountId,
    actorId,
    action: "PROMISE_TO_PAY_UPDATED",
    entityType: "PromiseToPay",
    entityId: promiseId,
    previousValues,
    newValues,
    ipAddress,
    userAgent,
  });
}

/**
 * Log credit hold recommended
 */
export async function logHoldRecommended({ tenantId, branchId, caseId, creditAccountId, actorId, holdId, ipAddress, userAgent }) {
  return createAuditLog({
    tenantId,
    branchId,
    caseId,
    creditAccountId,
    actorId,
    action: "CREDIT_HOLD_RECOMMENDED",
    entityType: "CreditHold",
    entityId: holdId,
    ipAddress,
    userAgent,
  });
}

/**
 * Log credit hold approved
 */
export async function logHoldApproved({ tenantId, branchId, caseId, creditAccountId, actorId, holdId, ipAddress, userAgent }) {
  return createAuditLog({
    tenantId,
    branchId,
    caseId,
    creditAccountId,
    actorId,
    action: "CREDIT_HOLD_APPROVED",
    entityType: "CreditHold",
    entityId: holdId,
    ipAddress,
    userAgent,
  });
}

/**
 * Log credit hold released
 */
export async function logHoldReleased({ tenantId, branchId, caseId, creditAccountId, actorId, holdId, ipAddress, userAgent }) {
  return createAuditLog({
    tenantId,
    branchId,
    caseId,
    creditAccountId,
    actorId,
    action: "CREDIT_HOLD_RELEASED",
    entityType: "CreditHold",
    entityId: holdId,
    ipAddress,
    userAgent,
  });
}

/**
 * Log dispute created
 */
export async function logDisputeCreated({ tenantId, branchId, caseId, creditAccountId, actorId, disputeId, ipAddress, userAgent }) {
  return createAuditLog({
    tenantId,
    branchId,
    caseId,
    creditAccountId,
    actorId,
    action: "DISPUTE_CREATED",
    entityType: "CreditDispute",
    entityId: disputeId,
    ipAddress,
    userAgent,
  });
}

/**
 * Log dispute resolved
 */
export async function logDisputeResolved({ tenantId, branchId, caseId, creditAccountId, actorId, disputeId, ipAddress, userAgent }) {
  return createAuditLog({
    tenantId,
    branchId,
    caseId,
    creditAccountId,
    actorId,
    action: "DISPUTE_RESOLVED",
    entityType: "CreditDispute",
    entityId: disputeId,
    ipAddress,
    userAgent,
  });
}

/**
 * Log write-off recommended
 */
export async function logWriteOffRecommended({ tenantId, branchId, caseId, creditAccountId, actorId, writeOffId, ipAddress, userAgent }) {
  return createAuditLog({
    tenantId,
    branchId,
    caseId,
    creditAccountId,
    actorId,
    action: "WRITE_OFF_RECOMMENDED",
    entityType: "WriteOffRecommendation",
    entityId: writeOffId,
    ipAddress,
    userAgent,
  });
}

/**
 * Log write-off approved
 */
export async function logWriteOffApproved({ tenantId, branchId, caseId, creditAccountId, actorId, writeOffId, ipAddress, userAgent }) {
  return createAuditLog({
    tenantId,
    branchId,
    caseId,
    creditAccountId,
    actorId,
    action: "WRITE_OFF_APPROVED",
    entityType: "WriteOffRecommendation",
    entityId: writeOffId,
    ipAddress,
    userAgent,
  });
}

/**
 * Log case closed
 */
export async function logCaseClosed({ tenantId, branchId, caseId, creditAccountId, actorId, closureReason, ipAddress, userAgent }) {
  return createAuditLog({
    tenantId,
    branchId,
    caseId,
    creditAccountId,
    actorId,
    action: "CASE_CLOSED",
    entityType: "CreditControlCase",
    entityId: caseId,
    newValues: { closureReason },
    reason: closureReason,
    ipAddress,
    userAgent,
  });
}
