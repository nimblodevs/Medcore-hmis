import { promiseRepository } from "../repositories/promise.repository.js";
import { logPromiseCreated, logPromiseUpdated } from "./credit-audit.service.js";

/**
 * Create a promise to pay
 * @param {Object} params - Promise parameters
 * @param {string} params.caseId - Case ID
 * @param {string} params.tenantId - Tenant ID
 * @param {string} params.branchId - Branch ID
 * @param {number} params.promisedAmount - Amount promised to pay
 * @param {Date} params.promisedDate - Date when payment is promised
 * @param {string} [params.notes] - Additional notes
 * @param {string} [params.createdById] - User ID creating the promise
 * @returns {Promise<Object>} Created promise
 */
export async function createPromise({
  caseId,
  tenantId,
  branchId,
  promisedAmount,
  promisedDate,
  notes,
  createdById,
}) {
  const promiseData = {
    tenantId,
    branchId,
    caseId,
    promisedAmount,
    promisedDate,
    notes: notes || null,
    createdById: createdById || null,
  };

  return promiseRepository.create(promiseData);
}

/**
 * Mark a promise as fulfilled
 * @param {Object} params - Fulfillment parameters
 * @param {string} params.promiseId - Promise ID
 * @param {string} params.tenantId - Tenant ID
 * @param {string} params.branchId - Branch ID
 * @param {number} params.fulfilledAmount - Amount actually paid
 * @param {string} [params.updatedById] - User ID marking fulfillment
 * @returns {Promise<Object>} Updated promise
 */
export async function markPromiseFulfilled({
  promiseId,
  tenantId,
  branchId,
  fulfilledAmount,
  updatedById,
}) {
  const existingPromise = await promiseRepository.findById(promiseId);
  if (!existingPromise) {
    throw new Error("Promise to pay not found");
  }

  // Prepare previous values for audit
  const previousValues = {
    isFulfilled: existingPromise.isFulfilled,
    fulfilledAt: existingPromise.fulfilledAt,
    fulfilledAmount: existingPromise.fulfilledAmount,
  };

  const updatedPromise = await promiseRepository.markFulfilled(promiseId, fulfilledAmount);

  // Log audit
  await logPromiseUpdated({
    tenantId,
    branchId,
    caseId: existingPromise.caseId,
    creditAccountId: null,
    actorId: updatedById,
    promiseId,
    previousValues,
    newValues: {
      isFulfilled: true,
      fulfilledAt: new Date().toISOString(),
      fulfilledAmount,
    },
  });

  return updatedPromise;
}

/**
 * Get overdue promises
 */
export async function getOverduePromises(tenantId, branchId) {
  return promiseRepository.findOverdue(tenantId, branchId);
}

/**
 * Get promises due today
 */
export async function getPromisesDueToday(tenantId, branchId) {
  return promiseRepository.findDueToday(tenantId, branchId);
}
