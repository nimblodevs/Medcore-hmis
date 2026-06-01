import prisma from "../../../config/database.js";

/**
 * Get debtor summary report
 */
export async function getDebtorSummaryReport(tenantId, branchId, filters = {}) {
  const { debtorType, status } = filters;

  const where = {
    tenantId,
    branchId: branchId || null
  };

  if (debtorType) {
    where.debtorType = debtorType;
  }

  if (status) {
    where.status = status;
  }

  const [accounts, totalByType, totalByStatus] = await Promise.all([
    prisma.debtorAccount.findMany({
      where,
      select: {
        id: true,
        debtorCode: true,
        debtorName: true,
        debtorType: true,
        status: true,
        creditLimit: true,
        currentBalance: true,
        availableCredit: true,
        createdAt: true
      }
    }),
    prisma.debtorAccount.groupBy({
      by: ['debtorType'],
      where,
      _count: true,
      _sum: {
        creditLimit: true,
        currentBalance: true
      }
    }),
    prisma.debtorAccount.groupBy({
      by: ['status'],
      where,
      _count: true,
      _sum: {
        creditLimit: true,
        currentBalance: true
      }
    })
  ]);

  const summary = {
    totalAccounts: accounts.length,
    totalCreditLimit: 0,
    totalOutstanding: 0,
    totalAvailableCredit: 0,
    byType: {},
    byStatus: {}
  };

  // Aggregate totals
  accounts.forEach(account => {
    summary.totalCreditLimit += account.creditLimit.toNumber();
    summary.totalOutstanding += account.currentBalance.toNumber();
    summary.totalAvailableCredit += account.availableCredit.toNumber();
  });

  // Process by type
  totalByType.forEach(item => {
    summary.byType[item.debtorType] = {
      count: item._count,
      totalCreditLimit: item._sum.creditLimit?.toNumber() || 0,
      totalOutstanding: item._sum.currentBalance?.toNumber() || 0
    };
  });

  // Process by status
  totalByStatus.forEach(item => {
    summary.byStatus[item.status] = {
      count: item._count,
      totalCreditLimit: item._sum.creditLimit?.toNumber() || 0,
      totalOutstanding: item._sum.currentBalance?.toNumber() || 0
    };
  });

  return {
    ...summary,
    accounts: accounts.map(a => ({
      ...a,
      creditLimit: a.creditLimit.toNumber(),
      currentBalance: a.currentBalance.toNumber(),
      availableCredit: a.availableCredit.toNumber()
    }))
  };
}

/**
 * Get outstanding report by debtor type
 */
export async function getOutstandingByTypeReport(tenantId, branchId) {
  const results = await prisma.debtorAccount.groupBy({
    by: ['debtorType'],
    where: {
      tenantId,
      branchId: branchId || null
    },
    _count: true,
    _sum: {
      creditLimit: true,
      currentBalance: true,
      availableCredit: true
    },
    _avg: {
      creditLimit: true,
      currentBalance: true
    }
  });

  return results.map(item => ({
    debtorType: item.debtorType,
    accountCount: item._count,
    totalCreditLimit: item._sum.creditLimit?.toNumber() || 0,
    totalOutstanding: item._sum.currentBalance?.toNumber() || 0,
    totalAvailableCredit: item._sum.availableCredit?.toNumber() || 0,
    averageCreditLimit: item._avg.creditLimit?.toNumber() || 0,
    averageOutstanding: item._avg.currentBalance?.toNumber() || 0,
    utilizationPercentage: item._sum.creditLimit?.toNumber() > 0
      ? ((item._sum.currentBalance?.toNumber() || 0) / item._sum.creditLimit.toNumber()) * 100
      : 0
  }));
}

/**
 * Get outstanding report by individual debtor
 */
export async function getOutstandingByDebtorReport(tenantId, branchId, filters = {}) {
  const { debtorType, status, minOutstanding } = filters;

  const where = {
    tenantId,
    branchId: branchId || null,
    currentBalance: { gt: 0 }
  };

  if (debtorType) {
    where.debtorType = debtorType;
  }

  if (status) {
    where.status = status;
  }

  if (minOutstanding) {
    where.currentBalance = {
      ...where.currentBalance,
      gte: parseFloat(minOutstanding)
    };
  }

  const accounts = await prisma.debtorAccount.findMany({
    where,
    select: {
      id: true,
      debtorCode: true,
      debtorName: true,
      debtorType: true,
      status: true,
      email: true,
      phone: true,
      creditLimit: true,
      currentBalance: true,
      availableCredit: true,
      paymentTermsDays: true,
      activatedAt: true,
      _count: {
        select: {
          invoices: true,
          statements: true
        }
      }
    },
    orderBy: {
      currentBalance: 'desc'
    }
  });

  return accounts.map(account => ({
    ...account,
    creditLimit: account.creditLimit.toNumber(),
    currentBalance: account.currentBalance.toNumber(),
    availableCredit: account.availableCredit.toNumber(),
    utilizationPercentage: account.creditLimit > 0
      ? ((account.currentBalance / account.creditLimit) * 100).toFixed(2)
      : 0
  }));
}

/**
 * Get credit limit utilization report
 */
export async function getCreditLimitsReport(tenantId, branchId, filters = {}) {
  const { minUtilization } = filters;

  const where = {
    tenantId,
    branchId: branchId || null,
    creditLimit: { gt: 0 }
  };

  const accounts = await prisma.debtorAccount.findMany({
    where,
    select: {
      id: true,
      debtorCode: true,
      debtorName: true,
      debtorType: true,
      status: true,
      creditLimit: true,
      currentBalance: true,
      availableCredit: true
    }
  });

  let results = accounts.map(account => {
    const utilization = (account.currentBalance / account.creditLimit) * 100;
    return {
      ...account,
      creditLimit: account.creditLimit.toNumber(),
      currentBalance: account.currentBalance.toNumber(),
      availableCredit: account.availableCredit.toNumber(),
      utilizationPercentage: Number(utilization.toFixed(2)),
      isOverLimit: account.currentBalance > account.creditLimit,
      riskLevel: utilization >= 90 ? 'HIGH' : utilization >= 70 ? 'MEDIUM' : 'LOW'
    };
  });

  if (minUtilization) {
    results = results.filter(r => r.utilizationPercentage >= parseFloat(minUtilization));
  }

  return results.sort((a, b) => b.utilizationPercentage - a.utilizationPercentage);
}

/**
 * Get statements report
 */
export async function getStatementsReport(tenantId, branchId, filters = {}) {
  const { status, periodStart, periodEnd, debtorType } = filters;

  const where = {
    debtorAccount: {
      tenantId,
      branchId: branchId || null
    }
  };

  if (status) {
    where.status = status;
  }

  if (periodStart) {
    where.periodStart = { gte: new Date(periodStart) };
  }

  if (periodEnd) {
    where.periodEnd = where.periodEnd || {};
    where.periodEnd.lte = new Date(periodEnd);
  }

  if (debtorType) {
    where.debtorAccount = {
      ...where.debtorAccount,
      debtorType
    };
  }

  const statements = await prisma.debtorStatement.findMany({
    where,
    include: {
      debtorAccount: {
        select: {
          debtorCode: true,
          debtorName: true,
          debtorType: true
        }
      }
    },
    orderBy: { periodEnd: 'desc' }
  });

  return statements.map(s => ({
    ...s,
    openingBalance: s.openingBalance.toNumber(),
    invoiceTotal: s.invoiceTotal.toNumber(),
    paymentTotal: s.paymentTotal.toNumber(),
    adjustmentTotal: s.adjustmentTotal.toNumber(),
    closingBalance: s.closingBalance.toNumber()
  }));
}

/**
 * Get reconciliation report
 */
export async function getReconciliationReport(tenantId, branchId, filters = {}) {
  const { status, dateFrom, dateTo } = filters;

  const where = {
    debtorAccount: {
      tenantId,
      branchId: branchId || null
    }
  };

  if (status) {
    where.status = status;
  }

  if (dateFrom) {
    where.startedAt = { gte: new Date(dateFrom) };
  }

  if (dateTo) {
    where.startedAt = where.startedAt || {};
    where.startedAt.lte = new Date(dateTo);
  }

  const reconciliations = await prisma.debtorReconciliation.findMany({
    where,
    include: {
      debtorAccount: {
        select: {
          debtorCode: true,
          debtorName: true,
          debtorType: true
        }
      }
    },
    orderBy: { startedAt: 'desc' }
  });

  return reconciliations.map(r => ({
    ...r,
    remittanceAmount: r.remittanceAmount?.toNumber() || 0,
    matchedAmount: r.matchedAmount.toNumber(),
    unmatchedAmount: r.unmatchedAmount.toNumber()
  }));
}

/**
 * Get SHA specific report
 */
export async function getShaReport(tenantId, branchId, filters = {}) {
  const { status } = filters;

  const where = {
    tenantId,
    branchId: branchId || null,
    debtorType: 'SHA'
  };

  if (status) {
    where.status = status;
  }

  const accounts = await prisma.debtorAccount.findMany({
    where,
    select: {
      id: true,
      debtorCode: true,
      debtorName: true,
      status: true,
      creditLimit: true,
      currentBalance: true,
      requiresPreAuthorization: true,
      allowsOutpatientBilling: true,
      allowsInpatientBilling: true,
      activatedAt: true,
      _count: {
        select: {
          contacts: true,
          contracts: true,
          statements: true
        }
      }
    }
  });

  return accounts.map(a => ({
    ...a,
    creditLimit: a.creditLimit.toNumber(),
    currentBalance: a.currentBalance.toNumber()
  }));
}

/**
 * Get insurance specific report
 */
export async function getInsuranceReport(tenantId, branchId, filters = {}) {
  const { status } = filters;

  const where = {
    tenantId,
    branchId: branchId || null,
    debtorType: 'INSURANCE'
  };

  if (status) {
    where.status = status;
  }

  const accounts = await prisma.debtorAccount.findMany({
    where,
    select: {
      id: true,
      debtorCode: true,
      debtorName: true,
      status: true,
      creditLimit: true,
      currentBalance: true,
      requiresPreAuthorization: true,
      activatedAt: true,
      _count: {
        select: {
          contacts: true,
          contracts: true,
          statements: true
        }
      }
    }
  });

  return accounts.map(a => ({
    ...a,
    creditLimit: a.creditLimit.toNumber(),
    currentBalance: a.currentBalance.toNumber()
  }));
}

/**
 * Get corporate specific report
 */
export async function getCorporateReport(tenantId, branchId, filters = {}) {
  const { status, includeDirectCorporate } = filters;

  const where = {
    tenantId,
    branchId: branchId || null,
    debtorType: {
      in: includeDirectCorporate 
        ? ['CORPORATE', 'DIRECT_CORPORATE']
        : ['CORPORATE']
    }
  };

  if (status) {
    where.status = status;
  }

  const accounts = await prisma.debtorAccount.findMany({
    where,
    select: {
      id: true,
      debtorCode: true,
      debtorName: true,
      debtorType: true,
      status: true,
      creditLimit: true,
      currentBalance: true,
      paymentTermsDays: true,
      billingCycle: true,
      activatedAt: true,
      _count: {
        select: {
          contacts: true,
          contracts: true,
          statements: true
        }
      }
    }
  });

  return accounts.map(a => ({
    ...a,
    creditLimit: a.creditLimit.toNumber(),
    currentBalance: a.currentBalance.toNumber()
  }));
}

/**
 * Get account status report
 */
export async function getAccountStatusReport(tenantId, branchId) {
  const statusCounts = await prisma.debtorAccount.groupBy({
    by: ['status'],
    where: {
      tenantId,
      branchId: branchId || null
    },
    _count: true,
    _sum: {
      creditLimit: true,
      currentBalance: true
    }
  });

  const result = {
    DRAFT: { count: 0, totalCreditLimit: 0, totalOutstanding: 0 },
    ACTIVE: { count: 0, totalCreditLimit: 0, totalOutstanding: 0 },
    ON_HOLD: { count: 0, totalCreditLimit: 0, totalOutstanding: 0 },
    SUSPENDED: { count: 0, totalCreditLimit: 0, totalOutstanding: 0 },
    CLOSED: { count: 0, totalCreditLimit: 0, totalOutstanding: 0 },
    ARCHIVED: { count: 0, totalCreditLimit: 0, totalOutstanding: 0 }
  };

  statusCounts.forEach(item => {
    if (result[item.status]) {
      result[item.status] = {
        count: item._count,
        totalCreditLimit: item._sum.creditLimit?.toNumber() || 0,
        totalOutstanding: item._sum.currentBalance?.toNumber() || 0
      };
    }
  });

  return result;
}

export default {
  getDebtorSummaryReport,
  getOutstandingByTypeReport,
  getOutstandingByDebtorReport,
  getCreditLimitsReport,
  getStatementsReport,
  getReconciliationReport,
  getShaReport,
  getInsuranceReport,
  getCorporateReport,
  getAccountStatusReport
};
