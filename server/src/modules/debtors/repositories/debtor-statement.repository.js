import prisma from "../../../config/database.js";

/**
 * Generate unique statement number
 */
async function generateStatementNumber() {
  const prefix = "STM";
  const date = new Date();
  const yearMonth = date.toISOString().slice(0, 7).replace('-', ''); // YYYYMM
  
  const lastStatement = await prisma.debtorStatement.findFirst({
    where: {
      statementNumber: {
        startsWith: `${prefix}-${yearMonth}`
      }
    },
    orderBy: { statementNumber: 'desc' }
  });

  if (lastStatement) {
    const lastNum = parseInt(lastStatement.statementNumber.split('-')[2]);
    const nextNum = lastNum + 1;
    return `${prefix}-${yearMonth}-${String(nextNum).padStart(6, '0')}`;
  }

  return `${prefix}-${yearMonth}-000001`;
}

/**
 * Generate a debtor statement
 */
export async function generateDebtorStatement(accountId, data, user, context = {}) {
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

  const periodStart = new Date(data.periodStart);
  const periodEnd = new Date(data.periodEnd);

  if (periodEnd < periodStart) {
    throw new Error("Period end cannot be before period start");
  }

  // Calculate totals from invoices and payments in the period
  // This is a simplified version - in production, this would query actual invoice/payment tables
  const openingBalance = account.currentBalance; // Simplified - should calculate from transactions before periodStart
  const invoiceTotal = data.invoiceTotal || 0;
  const paymentTotal = data.paymentTotal || 0;
  const adjustmentTotal = data.adjustmentTotal || 0;
  const closingBalance = openingBalance + invoiceTotal - paymentTotal + adjustmentTotal;

  const statementNumber = await generateStatementNumber();

  return await prisma.$transaction(async (tx) => {
    const statement = await tx.debtorStatement.create({
      data: {
        statementNumber,
        debtorAccountId: accountId,
        periodStart,
        periodEnd,
        openingBalance,
        invoiceTotal,
        paymentTotal,
        adjustmentTotal,
        closingBalance,
        status: "GENERATED",
        generatedById: user?.id,
        generatedAt: new Date()
      }
    });

    await tx.debtorAuditLog.create({
      data: {
        debtorAccountId: accountId,
        actorId: user?.id,
        action: "STATEMENT_GENERATED",
        entityType: "DebtorStatement",
        entityId: statement.id,
        newValues: {
          statementNumber: statement.statementNumber,
          periodStart: statement.periodStart,
          periodEnd: statement.periodEnd,
          closingBalance: statement.closingBalance
        },
        ipAddress: context.ipAddress,
        userAgent: context.userAgent
      }
    });

    return statement;
  });
}

/**
 * Get all statements for a debtor account
 */
export async function getDebtorStatements(accountId, filters = {}, tenantId, branchId) {
  const { status, periodStart, periodEnd } = filters;

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

  if (periodStart) {
    where.periodStart = { gte: new Date(periodStart) };
  }

  if (periodEnd) {
    where.periodEnd = where.periodEnd || {};
    where.periodEnd.lte = new Date(periodEnd);
  }

  return await prisma.debtorStatement.findMany({
    where,
    orderBy: { periodEnd: 'desc' }
  });
}

/**
 * Get a single statement by ID
 */
export async function getDebtorStatementById(statementId, tenantId, branchId) {
  const statement = await prisma.debtorStatement.findFirst({
    where: {
      id: statementId,
      debtorAccount: {
        tenantId,
        branchId: branchId || null
      }
    }
  });

  if (!statement) {
    throw new Error("Statement not found");
  }

  return statement;
}

/**
 * Mark statement as sent
 */
export async function markStatementAsSent(statementId, user, context = {}) {
  const { tenantId, branchId } = context;

  const existing = await prisma.debtorStatement.findFirst({
    where: {
      id: statementId,
      debtorAccount: {
        tenantId,
        branchId: branchId || null
      }
    }
  });

  if (!existing) {
    throw new Error("Statement not found");
  }

  if (existing.status !== "GENERATED") {
    throw new Error(`Cannot send statement with status: ${existing.status}`);
  }

  return await prisma.$transaction(async (tx) => {
    const statement = await tx.debtorStatement.update({
      where: { id: statementId },
      data: {
        status: "SENT",
        sentById: user?.id,
        sentAt: new Date()
      }
    });

    await tx.debtorAuditLog.create({
      data: {
        debtorAccountId: existing.debtorAccountId,
        actorId: user?.id,
        action: "STATEMENT_SENT",
        entityType: "DebtorStatement",
        entityId: statement.id,
        newValues: { status: "SENT" },
        ipAddress: context.ipAddress,
        userAgent: context.userAgent
      }
    });

    return statement;
  });
}

/**
 * Acknowledge a statement
 */
export async function acknowledgeStatement(statementId, user, context = {}) {
  const { tenantId, branchId } = context;

  const existing = await prisma.debtorStatement.findFirst({
    where: {
      id: statementId,
      debtorAccount: {
        tenantId,
        branchId: branchId || null
      }
    }
  });

  if (!existing) {
    throw new Error("Statement not found");
  }

  return await prisma.$transaction(async (tx) => {
    const statement = await tx.debtorStatement.update({
      where: { id: statementId },
      data: {
        status: "ACKNOWLEDGED",
        acknowledgedAt: new Date()
      }
    });

    await tx.debtorAuditLog.create({
      data: {
        debtorAccountId: existing.debtorAccountId,
        actorId: user?.id,
        action: "STATEMENT_ACKNOWLEDGED",
        entityType: "DebtorStatement",
        entityId: statement.id,
        newValues: { status: "ACKNOWLEDGED" },
        ipAddress: context.ipAddress,
        userAgent: context.userAgent
      }
    });

    return statement;
  });
}

/**
 * Dispute a statement
 */
export async function disputeStatement(statementId, reason, user, context = {}) {
  const { tenantId, branchId } = context;

  const existing = await prisma.debtorStatement.findFirst({
    where: {
      id: statementId,
      debtorAccount: {
        tenantId,
        branchId: branchId || null
      }
    }
  });

  if (!existing) {
    throw new Error("Statement not found");
  }

  if (!reason || reason.trim().length === 0) {
    throw new Error("Dispute reason is required");
  }

  return await prisma.$transaction(async (tx) => {
    const statement = await tx.debtorStatement.update({
      where: { id: statementId },
      data: {
        status: "DISPUTED",
        disputedAt: new Date(),
        disputeReason: reason.trim()
      }
    });

    await tx.debtorAuditLog.create({
      data: {
        debtorAccountId: existing.debtorAccountId,
        actorId: user?.id,
        action: "STATEMENT_DISPUTED",
        entityType: "DebtorStatement",
        entityId: statement.id,
        newValues: { status: "DISPUTED", disputeReason: reason.trim() },
        reason: reason.trim(),
        ipAddress: context.ipAddress,
        userAgent: context.userAgent
      }
    });

    return statement;
  });
}

/**
 * Cancel a statement
 */
export async function cancelStatement(statementId, reason, user, context = {}) {
  const { tenantId, branchId } = context;

  const existing = await prisma.debtorStatement.findFirst({
    where: {
      id: statementId,
      debtorAccount: {
        tenantId,
        branchId: branchId || null
      }
    }
  });

  if (!existing) {
    throw new Error("Statement not found");
  }

  if (existing.status === "SENT" || existing.status === "ACKNOWLEDGED") {
    throw new Error(`Cannot cancel statement with status: ${existing.status}. Please contact administrator.`);
  }

  return await prisma.$transaction(async (tx) => {
    const statement = await tx.debtorStatement.update({
      where: { id: statementId },
      data: {
        status: "CANCELLED"
      }
    });

    await tx.debtorAuditLog.create({
      data: {
        debtorAccountId: existing.debtorAccountId,
        actorId: user?.id,
        action: "STATEMENT_CANCELLED",
        entityType: "DebtorStatement",
        entityId: statement.id,
        newValues: { status: "CANCELLED" },
        reason: reason?.trim(),
        ipAddress: context.ipAddress,
        userAgent: context.userAgent
      }
    });

    return statement;
  });
}

export default {
  generateDebtorStatement,
  getDebtorStatements,
  getDebtorStatementById,
  markStatementAsSent,
  acknowledgeStatement,
  disputeStatement,
  cancelStatement
};
