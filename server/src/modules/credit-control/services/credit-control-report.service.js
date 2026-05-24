import { caseRepository } from "../repositories/case.repository.js";

/**
 * Get credit control dashboard statistics
 * @param {string} tenantId - Tenant ID
 * @param {string} branchId - Branch ID
 * @returns {Promise<Object>} Dashboard statistics
 */
export async function getDashboardStats(tenantId, branchId) {
  const stats = await caseRepository.getDashboardStats(tenantId, branchId);

  // Calculate totals
  const totalActiveCases =
    stats.openCases +
    stats.inProgressCases +
    stats.promisedToPayCases +
    stats.disputedCases +
    stats.escalatedCases +
    stats.onHoldCases;

  return {
    totalActiveCases,
    ...stats,
  };
}

/**
 * Get aging report for accounts
 * @param {string} tenantId - Tenant ID
 * @param {string} branchId - Branch ID
 * @param {Object} options - Report options
 * @returns {Promise<Object>} Aging report data
 */
export async function getAgingReport(tenantId, branchId, options = {}) {
  const { status, riskLevel } = options;

  const filters = {
    tenantId,
    branchId,
    page: 1,
    limit: 1000, // Get all for report
  };

  if (status) filters.status = status;
  if (riskLevel) filters.riskLevel = riskLevel;

  const result = await caseRepository.findByFilters(filters);

  // Group by aging bucket
  const agingSummary = {
    CURRENT: { count: 0, amount: 0 },
    DAYS_1_30: { count: 0, amount: 0 },
    DAYS_31_60: { count: 0, amount: 0 },
    DAYS_61_90: { count: 0, amount: 0 },
    DAYS_91_120: { count: 0, amount: 0 },
    OVER_120: { count: 0, amount: 0 },
  };

  result.cases.forEach((caseItem) => {
    const bucket = caseItem.agingBucket;
    agingSummary[bucket].count += 1;
    agingSummary[bucket].amount += parseFloat(caseItem.outstandingAmount) || 0;
  });

  return {
    summary: agingSummary,
    cases: result.cases,
    total: result.total,
  };
}

/**
 * Get collector workload report
 * @param {string} tenantId - Tenant ID
 * @param {string} branchId - Branch ID
 * @returns {Promise<Array>} Collector workload data
 */
export async function getCollectorWorkload(tenantId, branchId) {
  // Get all cases grouped by collector
  const result = await caseRepository.findByFilters({
    tenantId,
    branchId,
    page: 1,
    limit: 1000,
  });

  // Group by assigned collector
  const workloadMap = new Map();

  result.cases.forEach((caseItem) => {
    const collectorId = caseItem.assignedCollectorId || "UNASSIGNED";
    if (!workloadMap.has(collectorId)) {
      workloadMap.set(collectorId, {
        collectorId,
        totalCases: 0,
        openCases: 0,
        inProgressCases: 0,
        promisedToPayCases: 0,
        disputedCases: 0,
        escalatedCases: 0,
        totalOutstanding: 0,
        totalOverdue: 0,
      });
    }

    const collector = workloadMap.get(collectorId);
    collector.totalCases += 1;
    collector.totalOutstanding += parseFloat(caseItem.outstandingAmount) || 0;
    collector.totalOverdue += parseFloat(caseItem.overdueAmount) || 0;

    switch (caseItem.status) {
      case "OPEN":
        collector.openCases += 1;
        break;
      case "IN_PROGRESS":
        collector.inProgressCases += 1;
        break;
      case "PROMISED_TO_PAY":
        collector.promisedToPayCases += 1;
        break;
      case "DISPUTED":
        collector.disputedCases += 1;
        break;
      case "ESCALATED":
        collector.escalatedCases += 1;
        break;
      default:
        break;
    }
  });

  return Array.from(workloadMap.values());
}

/**
 * Get promises report
 * @param {string} tenantId - Tenant ID
 * @param {string} branchId - Branch ID
 * @returns {Promise<Object>} Promises report data
 */
export async function getPromisesReport(tenantId, branchId) {
  // This would ideally query a dedicated promises repository
  // For now, we'll return a placeholder structure
  return {
    totalPromises: 0,
    fulfilledPromises: 0,
    overduePromises: 0,
    totalPromisedAmount: 0,
    totalFulfilledAmount: 0,
  };
}

/**
 * Get holds report
 * @param {string} tenantId - Tenant ID
 * @param {string} branchId - Branch ID
 * @returns {Promise<Object>} Holds report data
 */
export async function getHoldsReport(tenantId, branchId) {
  // This would ideally query a dedicated holds repository
  // For now, we'll return a placeholder structure
  return {
    activeHolds: 0,
    recommendedHolds: 0,
    releasedHolds: 0,
    rejectedHolds: 0,
  };
}

/**
 * Get disputes report
 * @param {string} tenantId - Tenant ID
 * @param {string} branchId - Branch ID
 * @returns {Promise<Object>} Disputes report data
 */
export async function getDisputesReport(tenantId, branchId) {
  // This would ideally query a dedicated disputes repository
  // For now, we'll return a placeholder structure
  return {
    openDisputes: 0,
    underReviewDisputes: 0,
    resolvedDisputes: 0,
    acceptedDisputes: 0,
    rejectedDisputes: 0,
    totalDisputedAmount: 0,
  };
}

/**
 * Get write-offs report
 * @param {string} tenantId - Tenant ID
 * @param {string} branchId - Branch ID
 * @returns {Promise<Object>} Write-offs report data
 */
export async function getWriteOffsReport(tenantId, branchId) {
  // This would ideally query a dedicated write-offs repository
  // For now, we'll return a placeholder structure
  return {
    pendingRecommendations: 0,
    approvedWriteOffs: 0,
    rejectedWriteOffs: 0,
    postedWriteOffs: 0,
    totalPendingAmount: 0,
    totalApprovedAmount: 0,
    totalPostedAmount: 0,
  };
}
