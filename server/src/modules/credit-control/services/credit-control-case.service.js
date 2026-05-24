import { caseRepository } from "../repositories/case.repository.js";
import { calculateAgingBucket, calculateRiskLevel, calculateDaysOverdue } from "./credit-aging.service.js";
import { logCaseCreated, logCaseUpdated, logCaseAssigned, logCaseClosed } from "./credit-audit.service.js";

/**
 * Generate a unique case number
 * @returns {string} Case number in format CC-YYYYMMDD-XXXX
 */
function generateCaseNumber() {
  const now = new Date();
  const datePart = now.toISOString().slice(0, 10).replace(/-/g, "");
  const randomPart = Math.floor(Math.random() * 9000 + 1000);
  return `CC-${datePart}-${randomPart}`;
}

/**
 * Create a new credit control case
 * @param {Object} params - Case creation parameters
 * @param {string} params.tenantId - Tenant ID
 * @param {string} params.branchId - Branch ID
 * @param {string} params.creditAccountId - Credit account ID
 * @param {string} [params.primaryInvoiceId] - Primary invoice ID
 * @param {number} params.outstandingAmount - Outstanding amount
 * @param {number} [params.overdueAmount] - Overdue amount (calculated if not provided)
 * @param {Date} [params.invoiceDueDate] - Invoice due date for aging calculation
 * @param {number} [params.creditLimit] - Credit limit for risk calculation
 * @param {string} [params.summary] - Case summary
 * @param {string} [params.notes] - Initial notes
 * @param {string} [params.createdById] - User ID creating the case
 * @param {string} [params.ipAddress] - IP address
 * @param {string} [params.userAgent] - User agent
 * @returns {Promise<Object>} Created case
 */
export async function createCase({
  tenantId,
  branchId,
  creditAccountId,
  primaryInvoiceId,
  outstandingAmount,
  overdueAmount = 0,
  invoiceDueDate,
  creditLimit = 0,
  summary,
  notes,
  createdById,
  ipAddress,
  userAgent,
}) {
  // Check for existing open case
  const existingCase = await caseRepository.findOpenCaseByAccount(tenantId, branchId, creditAccountId);
  if (existingCase) {
    throw new Error(`An open credit control case already exists for this account: ${existingCase.caseNumber}`);
  }

  // Calculate days overdue and aging bucket
  const daysOverdue = invoiceDueDate ? calculateDaysOverdue(invoiceDueDate) : 0;
  const agingBucket = calculateAgingBucket(daysOverdue);

  // Calculate risk level
  const riskLevel = calculateRiskLevel(daysOverdue, outstandingAmount, creditLimit);

  // Generate case number
  const caseNumber = generateCaseNumber();

  // Create the case
  const caseData = {
    caseNumber,
    tenantId,
    branchId,
    creditAccountId,
    primaryInvoiceId: primaryInvoiceId || null,
    status: "OPEN",
    riskLevel,
    agingBucket,
    outstandingAmount,
    overdueAmount,
    daysOverdue,
    summary: summary || null,
    notes: notes || null,
    createdById: createdById || null,
  };

  const newCase = await caseRepository.create(caseData);

  // Log audit
  await logCaseCreated({
    tenantId,
    branchId,
    caseId: newCase.id,
    creditAccountId,
    actorId: createdById,
    ipAddress,
    userAgent,
  });

  return newCase;
}

/**
 * Update a credit control case
 * @param {Object} params - Update parameters
 * @param {string} params.caseId - Case ID
 * @param {string} params.tenantId - Tenant ID
 * @param {string} params.branchId - Branch ID
 * @param {Object} params.updateData - Fields to update
 * @param {string} [params.updatedById] - User ID performing update
 * @param {string} [params.reason] - Reason for update
 * @param {string} [params.ipAddress] - IP address
 * @param {string} [params.userAgent] - User agent
 * @returns {Promise<Object>} Updated case
 */
export async function updateCase({
  caseId,
  tenantId,
  branchId,
  updateData,
  updatedById,
  reason,
  ipAddress,
  userAgent,
}) {
  const existingCase = await caseRepository.findById(caseId);
  if (!existingCase) {
    throw new Error("Credit control case not found");
  }

  if (existingCase.tenantId !== tenantId || existingCase.branchId !== branchId) {
    throw new Error("Unauthorized access to case");
  }

  // Prepare previous values for audit
  const previousValues = {
    status: existingCase.status,
    riskLevel: existingCase.riskLevel,
    agingBucket: existingCase.agingBucket,
    notes: existingCase.notes,
    summary: existingCase.summary,
  };

  // Update the case
  const updatedCase = await caseRepository.update(caseId, {
    ...updateData,
    updatedById: updatedById || null,
  });

  // Log audit
  await logCaseUpdated({
    tenantId,
    branchId,
    caseId,
    creditAccountId: existingCase.creditAccountId,
    actorId: updatedById,
    previousValues,
    newValues: updateData,
    reason,
    ipAddress,
    userAgent,
  });

  return updatedCase;
}

/**
 * Assign a collector to a case
 * @param {Object} params - Assignment parameters
 * @param {string} params.caseId - Case ID
 * @param {string} params.tenantId - Tenant ID
 * @param {string} params.branchId - Branch ID
 * @param {string} params.collectorId - Collector user ID to assign
 * @param {string} [params.assignedById] - User ID performing assignment
 * @param {string} [params.ipAddress] - IP address
 * @param {string} [params.userAgent] - User agent
 * @returns {Promise<Object>} Updated case
 */
export async function assignCollector({
  caseId,
  tenantId,
  branchId,
  collectorId,
  assignedById,
  ipAddress,
  userAgent,
}) {
  const existingCase = await caseRepository.findById(caseId);
  if (!existingCase) {
    throw new Error("Credit control case not found");
  }

  if (existingCase.tenantId !== tenantId || existingCase.branchId !== branchId) {
    throw new Error("Unauthorized access to case");
  }

  const updatedCase = await caseRepository.update(caseId, {
    assignedCollectorId: collectorId,
    assignedById: assignedById || null,
    assignedAt: new Date(),
  });

  // Log audit
  await logCaseAssigned({
    tenantId,
    branchId,
    caseId,
    creditAccountId: existingCase.creditAccountId,
    actorId: assignedById,
    assignedCollectorId: collectorId,
    ipAddress,
    userAgent,
  });

  return updatedCase;
}

/**
 * Close a credit control case
 * @param {Object} params - Closure parameters
 * @param {string} params.caseId - Case ID
 * @param {string} params.tenantId - Tenant ID
 * @param {string} params.branchId - Branch ID
 * @param {string} params.closureReason - Reason for closure
 * @param {string} [params.closedById] - User ID closing the case
 * @param {string} [params.ipAddress] - IP address
 * @param {string} [params.userAgent] - User agent
 * @returns {Promise<Object>} Updated case
 */
export async function closeCase({
  caseId,
  tenantId,
  branchId,
  closureReason,
  closedById,
  ipAddress,
  userAgent,
}) {
  const existingCase = await caseRepository.findById(caseId);
  if (!existingCase) {
    throw new Error("Credit control case not found");
  }

  if (existingCase.tenantId !== tenantId || existingCase.branchId !== branchId) {
    throw new Error("Unauthorized access to case");
  }

  if (["CLOSED", "CANCELLED", "RESOLVED"].includes(existingCase.status)) {
    throw new Error("Case is already closed");
  }

  const updatedCase = await caseRepository.update(caseId, {
    status: "CLOSED",
    closedById: closedById || null,
    closedAt: new Date(),
    closureReason,
  });

  // Log audit
  await logCaseClosed({
    tenantId,
    branchId,
    caseId,
    creditAccountId: existingCase.creditAccountId,
    actorId: closedById,
    closureReason,
    ipAddress,
    userAgent,
  });

  return updatedCase;
}

/**
 * Reopen a closed credit control case
 * @param {Object} params - Reopen parameters
 * @param {string} params.caseId - Case ID
 * @param {string} params.tenantId - Tenant ID
 * @param {string} params.branchId - Branch ID
 * @param {string} [params.reopenedById] - User ID reopening the case
 * @returns {Promise<Object>} Updated case
 */
export async function reopenCase({
  caseId,
  tenantId,
  branchId,
  reopenedById,
}) {
  const existingCase = await caseRepository.findById(caseId);
  if (!existingCase) {
    throw new Error("Credit control case not found");
  }

  if (existingCase.tenantId !== tenantId || existingCase.branchId !== branchId) {
    throw new Error("Unauthorized access to case");
  }

  if (!["CLOSED", "CANCELLED", "RESOLVED"].includes(existingCase.status)) {
    throw new Error("Case is not closed");
  }

  return caseRepository.update(caseId, {
    status: "OPEN",
    closedAt: null,
    closedById: null,
    closureReason: null,
    updatedById: reopenedById || null,
  });
}
