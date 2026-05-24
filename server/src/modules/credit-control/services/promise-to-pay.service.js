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

  const newPromise = await promiseRepository.create(promiseData);

  // Log audit
  if (createdById) {
    await logPromiseCreated({
      tenantId,
      branchId,
      caseId,
      creditAccountId: null,
      actorId: createdById,
      promiseId: newPromise.id,
      newValues: {
        promisedAmount,
        promisedDate,
        notes,
      },
    });
  }

  return newPromise;
}

/**
 * Update a promise to pay
 * @param {Object} params - Update parameters
 * @param {string} params.promiseId - Promise ID
 * @param {string} params.tenantId - Tenant ID
 * @param {string} params.branchId - Branch ID
 * @param {Object} params.updateData - Data to update
 * @param {string} [params.updatedById] - User ID updating the promise
 * @param {string} [params.reason] - Reason for update
 * @returns {Promise<Object>} Updated promise
 */
export async function updatePromise({
  promiseId,
  tenantId,
  branchId,
  updateData,
  updatedById,
  reason,
}) {
  const existingPromise = await promiseRepository.findById(promiseId);
  if (!existingPromise) {
    throw new Error("Promise to pay not found");
  }

  // Verify tenant/branch
  if (existingPromise.tenantId !== tenantId || existingPromise.branchId !== branchId) {
    throw new Error("Unauthorized access to promise");
  }

  // Prepare previous values for audit
  const previousValues = {};
  if (updateData.promisedAmount !== undefined) {
    previousValues.promisedAmount = existingPromise.promisedAmount;
  }
  if (updateData.promisedDate !== undefined) {
    previousValues.promisedDate = existingPromise.promisedDate;
  }
  if (updateData.notes !== undefined) {
    previousValues.notes = existingPromise.notes;
  }

  const updatedPromise = await promiseRepository.update(promiseId, updateData);

  // Log audit
  if (updatedById && Object.keys(previousValues).length > 0) {
    await logPromiseUpdated({
      tenantId,
      branchId,
      caseId: existingPromise.caseId,
      creditAccountId: null,
      actorId: updatedById,
      promiseId,
      previousValues,
      newValues: updateData,
      reason,
    });
  }

  return updatedPromise;
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

  // Verify tenant/branch
  if (existingPromise.tenantId !== tenantId || existingPromise.branchId !== branchId) {
    throw new Error("Unauthorized access to promise");
  }

  // Prepare previous values for audit
  const previousValues = {
    isFulfilled: existingPromise.isFulfilled,
    fulfilledAt: existingPromise.fulfilledAt,
    fulfilledAmount: existingPromise.fulfilledAmount,
  };

  const updatedPromise = await promiseRepository.markFulfilled(promiseId, fulfilledAmount);

  // Log audit
  if (updatedById) {
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
  }

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
