import prisma from "../../../config/database.js";

/**
 * Generate unique reconciliation number
 */
async function generateReconciliationNumber() {
  const prefix = "REC";
  const date = new Date();
  const yearMonth = date.toISOString().slice(0, 7).replace('-', ''); // YYYYMM
  
  const lastReconciliation = await prisma.debtorReconciliation.findFirst({
    where: {
      reconciliationNumber: {
        startsWith: `${prefix}-${yearMonth}`
      }
    },
    orderBy: { reconciliationNumber: 'desc' }
  });

  if (lastReconciliation) {
    const lastNum = parseInt(lastReconciliation.reconciliationNumber.split('-')[2]);
    const nextNum = lastNum + 1;
    return `${prefix}-${yearMonth}-${String(nextNum).padStart(6, '0')}`;
  }

  return `${prefix}-${yearMonth}-000001`;
}

/**
 * Create a new debtor reconciliation
 */
export async function createDebtorReconciliation(accountId, data, user, context = {}) {
  const { tenantId, branchId } = context;

  // Verify account exists
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

  // Verify statement exists if provided
  if (data.statementId) {
    const statement = await prisma.debtorStatement.findUnique({
      where: { id: data.statementId }
    });

    if (!statement) {
      throw new Error("Statement not found");
    }

    if (statement.debtorAccountId !== accountId) {
      throw new Error("Statement does not belong to this debtor account");
    }
  }

  const reconciliationNumber = await generateReconciliationNumber();

  return await prisma.$transaction(async (tx) => {
    const reconciliation = await tx.debtorReconciliation.create({
      data: {
        reconciliationNumber,
        debtorAccountId: accountId,
        statementId: data.statementId || null,
        paymentReference: data.paymentReference?.trim(),
        remittanceReference: data.remittanceReference?.trim(),
        remittanceAmount: data.remittanceAmount || null,
        matchedAmount: 0,
        unmatchedAmount: data.remittanceAmount || 0,
        status: "OPEN",
        startedById: user?.id,
        startedAt: new Date(),
        notes: data.notes?.trim()
      }
    });

    await tx.debtorAuditLog.create({
      data: {
        debtorAccountId: accountId,
        actorId: user?.id,
        action: "RECONCILIATION_CREATED",
        entityType: "DebtorReconciliation",
        entityId: reconciliation.id,
        newValues: {
          reconciliationNumber: reconciliation.reconciliationNumber,
          paymentReference: reconciliation.paymentReference,
          remittanceAmount: reconciliation.remittanceAmount
        },
        ipAddress: context.ipAddress,
        userAgent: context.userAgent
      }
    });

    return reconciliation;
  });
}

/**
 * Get all reconciliations for a debtor account
 */
export async function getDebtorReconciliations(accountId, filters = {}, tenantId, branchId) {
  const { status } = filters;

  const where = {
    debtorAccountId: accountId,
    debtorAccount: {
      tenantId,
      branchId: branchId || null
    }
  };

  if (status) {
    where.status = status;
  }

  return await prisma.debtorReconciliation.findMany({
    where,
    orderBy: { startedAt: 'desc' }
  });
}

/**
 * Get a single reconciliation by ID
 */
export async function getDebtorReconciliationById(reconciliationId, tenantId, branchId) {
  const reconciliation = await prisma.debtorReconciliation.findFirst({
    where: {
      id: reconciliationId,
      debtorAccount: {
        tenantId,
        branchId: branchId || null
      }
    }
  });

  if (!reconciliation) {
    throw new Error("Reconciliation not found");
  }

  return reconciliation;
}

/**
 * Update reconciliation matched amounts
 */
export async function updateDebtorReconciliation(reconciliationId, data, user, context = {}) {
  const { tenantId, branchId } = context;

  const existing = await prisma.debtorReconciliation.findFirst({
    where: {
      id: reconciliationId,
      debtorAccount: {
        tenantId,
        branchId: branchId || null
      }
    }
  });

  if (!existing) {
    throw new Error("Reconciliation not found");
  }

  if (existing.status === "CLOSED" || existing.status === "CANCELLED") {
    throw new Error(`Cannot update reconciliation with status: ${existing.status}`);
  }

  // Track changes for audit
  const previousValues = {};
  const newValues = {};

  const updatableFields = [
    'paymentReference', 'remittanceReference', 'remittanceAmount',
    'matchedAmount', 'unmatchedAmount', 'notes'
  ];

  updatableFields.forEach(field => {
    if (data[field] !== undefined && data[field] !== existing[field]) {
      previousValues[field] = existing[field];
      newValues[field] = data[field];
    }
  });

  return await prisma.$transaction(async (tx) => {
    const reconciliation = await tx.debtorReconciliation.update({
      where: { id: reconciliationId },
      data: {
        ...data,
        paymentReference: data.paymentReference?.trim(),
        remittanceReference: data.remittanceReference?.trim(),
        notes: data.notes?.trim(),
        // Auto-calculate unmatched amount if remittance and matched are provided
        unmatchedAmount: data.remittanceAmount !== undefined || data.matchedAmount !== undefined
          ? (data.remittanceAmount ?? existing.remittanceAmount) - (data.matchedAmount ?? existing.matchedAmount)
          : existing.unmatchedAmount
      }
    });

    if (Object.keys(newValues).length > 0) {
      await tx.debtorAuditLog.create({
        data: {
          debtorAccountId: existing.debtorAccountId,
          actorId: user?.id,
          action: "RECONCILIATION_UPDATED",
          entityType: "DebtorReconciliation",
          entityId: reconciliation.id,
          previousValues,
          newValues,
          ipAddress: context.ipAddress,
          userAgent: context.userAgent
        }
      });
    }

    return reconciliation;
  });
}

/**
 * Close a reconciliation
 */
export async function closeDebtorReconciliation(reconciliationId, user, context = {}) {
  const { tenantId, branchId } = context;

  const existing = await prisma.debtorReconciliation.findFirst({
    where: {
      id: reconciliationId,
      debtorAccount: {
        tenantId,
        branchId: branchId || null
      }
    }
  });

  if (!existing) {
    throw new Error("Reconciliation not found");
  }

  if (existing.status === "CLOSED" || existing.status === "CANCELLED") {
    throw new Error(`Reconciliation already ${existing.status.toLowerCase()}`);
  }

  // Determine final status based on matched/unmatched amounts
  let finalStatus = "MATCHED";
  if (existing.unmatchedAmount > 0) {
    if (existing.matchedAmount > 0) {
      finalStatus = "PARTIALLY_MATCHED";
    } else {
      finalStatus = "DISPUTED";
    }
  }

  return await prisma.$transaction(async (tx) => {
    const reconciliation = await tx.debtorReconciliation.update({
      where: { id: reconciliationId },
      data: {
        status: finalStatus,
        closedById: user?.id,
        closedAt: new Date()
      }
    });

    await tx.debtorAuditLog.create({
      data: {
        debtorAccountId: existing.debtorAccountId,
        actorId: user?.id,
        action: "RECONCILIATION_CLOSED",
        entityType: "DebtorReconciliation",
        entityId: reconciliation.id,
        newValues: { 
          status: finalStatus,
          matchedAmount: reconciliation.matchedAmount,
          unmatchedAmount: reconciliation.unmatchedAmount
        },
        ipAddress: context.ipAddress,
        userAgent: context.userAgent
      }
    });

    return reconciliation;
  });
}

/**
 * Cancel a reconciliation
 */
export async function cancelDebtorReconciliation(reconciliationId, reason, user, context = {}) {
  const { tenantId, branchId } = context;

  const existing = await prisma.debtorReconciliation.findFirst({
    where: {
      id: reconciliationId,
      debtorAccount: {
        tenantId,
        branchId: branchId || null
      }
    }
  });

  if (!existing) {
    throw new Error("Reconciliation not found");
  }

  if (existing.status === "CLOSED") {
    throw new Error("Cannot close a reconciliation that is already closed");
  }

  return await prisma.$transaction(async (tx) => {
    const reconciliation = await tx.debtorReconciliation.update({
      where: { id: reconciliationId },
      data: {
        status: "CANCELLED",
        closedById: user?.id,
        closedAt: new Date()
      }
    });

    await tx.debtorAuditLog.create({
      data: {
        debtorAccountId: existing.debtorAccountId,
        actorId: user?.id,
        action: "RECONCILIATION_CANCELLED",
        entityType: "DebtorReconciliation",
        entityId: reconciliation.id,
        newValues: { status: "CANCELLED" },
        reason: reason?.trim(),
        ipAddress: context.ipAddress,
        userAgent: context.userAgent
      }
    });

    return reconciliation;
  });
}

/**
 * Get reconciliation summary for account
 */
export async function getReconciliationSummary(accountId, tenantId, branchId) {
  const reconciliations = await prisma.debtorReconciliation.groupBy({
    by: ['status'],
    where: {
      debtorAccountId: accountId,
      debtorAccount: {
        tenantId,
        branchId: branchId || null
      }
    },
    _count: true,
    _sum: {
      matchedAmount: true,
      unmatchedAmount: true
    }
  });

  const summary = {
    total: 0,
    open: 0,
    inProgress: 0,
    matched: 0,
    partiallyMatched: 0,
    disputed: 0,
    closed: 0,
    cancelled: 0,
    totalMatchedAmount: 0,
    totalUnmatchedAmount: 0
  };

  reconciliations.forEach(r => {
    const count = r._count;
    const sum = r._sum;
    
    summary.total += count;
    summary[`${r.status.toLowerCase()}`.replace(' ', '')] = count;
    
    if (sum.matchedAmount) {
      summary.totalMatchedAmount += sum.matchedAmount;
    }
    if (sum.unmatchedAmount) {
      summary.totalUnmatchedAmount += sum.unmatchedAmount;
    }
  });

  return summary;
}

export default {
  createDebtorReconciliation,
  getDebtorReconciliations,
  getDebtorReconciliationById,
  updateDebtorReconciliation,
  closeDebtorReconciliation,
  cancelDebtorReconciliation,
  getReconciliationSummary
};
