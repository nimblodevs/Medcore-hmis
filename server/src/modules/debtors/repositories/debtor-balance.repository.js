import prisma from "../../../config/database.js";

/**
 * Recalculate debtor account balance from source transactions
 * This should integrate with Invoice Management, Cash Management, etc.
 */
export async function recalculateDebtorBalance(accountId, tenantId, branchId) {
  // In production, this would query:
  // - Approved invoices for this debtor
  // - Payment allocations
  // - Credit notes
  // - Debit notes
  // - Write-offs
  // - Adjustments
  
  // For now, we'll use a simplified calculation
  // This is a placeholder that should be replaced with actual integration
  
  const account = await prisma.debtorAccount.findFirst({
    where: {
      id: accountId,
      tenantId,
      branchId: branchId || null
    }
  });

  if (!account) {
    throw new Error("Debtor account not found");
  }

  // Placeholder: In production, calculate from actual transactions
  // const invoices = await prisma.invoice.aggregate({...})
  // const payments = await prisma.payment.aggregate({...})
  
  const currentBalance = account.currentBalance; // Placeholder
  const creditLimit = account.creditLimit;
  const availableCredit = creditLimit - currentBalance;

  await prisma.debtorAccount.update({
    where: { id: accountId },
    data: {
      currentBalance,
      availableCredit
    }
  });

  return {
    accountId,
    currentBalance,
    creditLimit,
    availableCredit,
    utilizationPercentage: creditLimit > 0 ? (currentBalance / creditLimit) * 100 : 0
  };
}

/**
 * Get current balance and credit information for a debtor account
 */
export async function getDebtorBalance(accountId, tenantId, branchId) {
  const account = await prisma.debtorAccount.findFirst({
    where: {
      id: accountId,
      tenantId,
      branchId: branchId || null
    },
    select: {
      id: true,
      debtorCode: true,
      debtorName: true,
      creditLimit: true,
      currentBalance: true,
      availableCredit: true,
      status: true
    }
  });

  if (!account) {
    throw new Error("Debtor account not found");
  }

  return {
    accountId: account.id,
    debtorCode: account.debtorCode,
    debtorName: account.debtorName,
    creditLimit: account.creditLimit,
    currentBalance: account.currentBalance,
    availableCredit: account.availableCredit,
    utilizationPercentage: account.creditLimit > 0 
      ? (account.currentBalance / account.creditLimit) * 100 
      : 0,
    status: account.status,
    isOverLimit: account.currentBalance > account.creditLimit,
    canBill: account.status === "ACTIVE" && account.availableCredit > 0
  };
}

/**
 * Check if account can be billed for a proposed amount
 */
export async function checkBillingEligibility(accountId, proposedAmount, tenantId, branchId) {
  const account = await prisma.debtorAccount.findFirst({
    where: {
      id: accountId,
      tenantId,
      branchId: branchId || null
    }
  });

  if (!account) {
    throw new Error("Debtor account not found");
  }

  const result = {
    eligible: false,
    requiresOverride: false,
    reason: "",
    accountStatus: account.status,
    currentBalance: account.currentBalance,
    creditLimit: account.creditLimit,
    availableCredit: account.availableCredit,
    proposedAmount,
    projectedBalance: account.currentBalance + proposedAmount,
    projectedAvailableCredit: account.availableCredit - proposedAmount
  };

  // Check account status
  if (account.status !== "ACTIVE") {
    result.reason = `Account status is ${account.status}. Only ACTIVE accounts can be billed.`;
    result.requiresOverride = true;
    return result;
  }

  // Check credit limit
  if (result.projectedBalance > account.creditLimit) {
    result.reason = `Proposed billing would exceed credit limit. Available: ${account.availableCredit}, Required: ${proposedAmount}`;
    result.requiresOverride = true;
    return result;
  }

  result.eligible = true;
  result.reason = "Account is eligible for billing";
  return result;
}

/**
 * Get aging summary for a debtor account
 * Aging buckets: Current, 1-30 days, 31-60 days, 61-90 days, 90+ days
 */
export async function getDebtorAging(accountId, tenantId, branchId, asOfDate = new Date()) {
  const account = await prisma.debtorAccount.findFirst({
    where: {
      id: accountId,
      tenantId,
      branchId: branchId || null
    }
  });

  if (!account) {
    throw new Error("Debtor account not found");
  }

  const asOf = asOfDate ? new Date(asOfDate) : new Date();

  // In production, this would query actual invoices with due dates
  // and calculate aging based on days overdue
  
  // Placeholder aging calculation
  // This should be replaced with actual invoice-based aging
  const aging = {
    accountId,
    debtorCode: account.debtorCode,
    debtorName: account.debtorName,
    asOfDate: asOf.toISOString(),
    totalOutstanding: account.currentBalance,
    buckets: {
      current: 0,        // Not yet due
      days1to30: 0,      // 1-30 days overdue
      days31to60: 0,     // 31-60 days overdue
      days61to90: 0,     // 61-90 days overdue
      daysOver90: 0      // 90+ days overdue
    },
    byBucket: [
      { bucket: "Current", amount: 0, percentage: 0 },
      { bucket: "1-30 days", amount: 0, percentage: 0 },
      { bucket: "31-60 days", amount: 0, percentage: 0 },
      { bucket: "61-90 days", amount: 0, percentage: 0 },
      { bucket: "90+ days", amount: 0, percentage: 0 }
    ]
  };

  // Calculate percentages
  const total = aging.totalOutstanding || 1; // Avoid division by zero
  aging.byBucket.forEach(bucket => {
    bucket.percentage = total > 0 ? (bucket.amount / total) * 100 : 0;
  });

  return aging;
}

/**
 * Get aging summary across all debtor accounts
 */
export async function getAgingSummary(tenantId, branchId, filters = {}, asOfDate = new Date()) {
  const { debtorType, status } = filters;
  const asOf = asOfDate ? new Date(asOfDate) : new Date();

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

  const accounts = await prisma.debtorAccount.findMany({
    where,
    select: {
      id: true,
      debtorCode: true,
      debtorName: true,
      debtorType: true,
      status: true,
      currentBalance: true,
      creditLimit: true
    }
  });

  const summary = {
    asOfDate: asOf.toISOString(),
    totalDebtors: accounts.length,
    totalOutstanding: 0,
    overCreditLimit: 0,
    byType: {},
    byStatus: {},
    agingBuckets: {
      current: 0,
      days1to30: 0,
      days31to60: 0,
      days61to90: 0,
      daysOver90: 0
    }
  };

  accounts.forEach(account => {
    summary.totalOutstanding += account.currentBalance.toNumber();
    
    if (account.currentBalance > account.creditLimit) {
      summary.overCreditLimit++;
    }

    // By type
    if (!summary.byType[account.debtorType]) {
      summary.byType[account.debtorType] = {
        count: 0,
        totalOutstanding: 0,
        totalCreditLimit: 0
      };
    }
    summary.byType[account.debtorType].count++;
    summary.byType[account.debtorType].totalOutstanding += account.currentBalance.toNumber();
    summary.byType[account.debtorType].totalCreditLimit += account.creditLimit.toNumber();

    // By status
    if (!summary.byStatus[account.status]) {
      summary.byStatus[account.status] = {
        count: 0,
        totalOutstanding: 0
      };
    }
    summary.byStatus[account.status].count++;
    summary.byStatus[account.status].totalOutstanding += account.currentBalance.toNumber();
  });

  // Convert Decimal values to numbers for JSON response
  Object.values(summary.byType).forEach(type => {
    type.totalOutstanding = Number(type.totalOutstanding);
    type.totalCreditLimit = Number(type.totalCreditLimit);
  });

  Object.values(summary.byStatus).forEach(status => {
    status.totalOutstanding = Number(status.totalOutstanding);
  });

  summary.totalOutstanding = Number(summary.totalOutstanding);

  return summary;
}

/**
 * Get accounts exceeding credit limits
 */
export async function getAccountsOverCreditLimit(tenantId, branchId) {
  const accounts = await prisma.debtorAccount.findMany({
    where: {
      tenantId,
      branchId: branchId || null,
      currentBalance: {
        gt: prisma.debtorAccount.fields.creditLimit
      }
    },
    select: {
      id: true,
      debtorCode: true,
      debtorName: true,
      debtorType: true,
      status: true,
      currentBalance: true,
      creditLimit: true,
      email: true,
      phone: true
    },
    orderBy: {
      currentBalance: 'desc'
    }
  });

  return accounts.map(account => ({
    ...account,
    currentBalance: account.currentBalance.toNumber(),
    creditLimit: account.creditLimit.toNumber(),
    overLimitAmount: (account.currentBalance - account.creditLimit).toNumber(),
    utilizationPercentage: ((account.currentBalance / account.creditLimit) * 100).toFixed(2)
  }));
}

export default {
  recalculateDebtorBalance,
  getDebtorBalance,
  checkBillingEligibility,
  getDebtorAging,
  getAgingSummary,
  getAccountsOverCreditLimit
};
