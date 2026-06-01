import prisma from "../../../config/database.js";

/**
 * Create a new debtor contract
 */
export async function createDebtorContract(accountId, data, user, context = {}) {
  const { tenantId, branchId } = context;

  // Verify account exists and belongs to tenant/branch
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

  // Validate dates
  if (data.endDate && new Date(data.endDate) < new Date(data.startDate)) {
    throw new Error("End date cannot be before start date");
  }

  return await prisma.$transaction(async (tx) => {
    const contract = await tx.debtorContract.create({
      data: {
        debtorAccountId: accountId,
        contractNumber: data.contractNumber?.trim(),
        contractName: data.contractName.trim(),
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        billingCycle: data.billingCycle || "MONTHLY",
        paymentTermsDays: data.paymentTermsDays || 30,
        creditLimit: data.creditLimit || null,
        requiresPreAuthorization: data.requiresPreAuthorization || false,
        outpatientAllowed: data.outpatientAllowed ?? true,
        inpatientAllowed: data.inpatientAllowed ?? true,
        pharmacyAllowed: data.pharmacyAllowed ?? true,
        laboratoryAllowed: data.laboratoryAllowed ?? true,
        radiologyAllowed: data.radiologyAllowed ?? true,
        isActive: data.isActive ?? true,
        notes: data.notes?.trim(),
        createdById: user?.id,
        updatedById: user?.id
      }
    });

    await tx.debtorAuditLog.create({
      data: {
        debtorAccountId: accountId,
        actorId: user?.id,
        action: "CONTRACT_CREATED",
        entityType: "DebtorContract",
        entityId: contract.id,
        newValues: {
          contractName: contract.contractName,
          contractNumber: contract.contractNumber,
          startDate: contract.startDate,
          endDate: contract.endDate
        },
        ipAddress: context.ipAddress,
        userAgent: context.userAgent
      }
    });

    return contract;
  });
}

/**
 * Get all contracts for a debtor account
 */
export async function getDebtorContracts(accountId, filters = {}, tenantId, branchId) {
  const { isActive } = filters;

  const where = {
    debtorAccountId: accountId,
    debtorAccount: {
      tenantId,
      branchId: branchId || null
    }
  };

  if (isActive !== undefined) {
    where.isActive = isActive;
  }

  return await prisma.debtorContract.findMany({
    where,
    orderBy: { startDate: 'desc' }
  });
}

/**
 * Get a single contract by ID
 */
export async function getDebtorContractById(contractId, tenantId, branchId) {
  const contract = await prisma.debtorContract.findFirst({
    where: {
      id: contractId,
      debtorAccount: {
        tenantId,
        branchId: branchId || null
      }
    }
  });

  if (!contract) {
    throw new Error("Contract not found");
  }

  return contract;
}

/**
 * Update a debtor contract
 */
export async function updateDebtorContract(contractId, data, user, context = {}) {
  const { tenantId, branchId } = context;

  // Get existing contract
  const existing = await prisma.debtorContract.findFirst({
    where: {
      id: contractId,
      debtorAccount: {
        tenantId,
        branchId: branchId || null
      }
    }
  });

  if (!existing) {
    throw new Error("Contract not found");
  }

  // Validate dates if being updated
  if (data.startDate || data.endDate) {
    const startDate = data.startDate ? new Date(data.startDate) : existing.startDate;
    const endDate = data.endDate ? new Date(data.endDate) : existing.endDate;
    
    if (endDate && endDate < startDate) {
      throw new Error("End date cannot be before start date");
    }
  }

  // Track changes for audit
  const previousValues = {};
  const newValues = {};

  const updatableFields = [
    'contractNumber', 'contractName', 'startDate', 'endDate',
    'billingCycle', 'paymentTermsDays', 'creditLimit',
    'requiresPreAuthorization', 'outpatientAllowed', 'inpatientAllowed',
    'pharmacyAllowed', 'laboratoryAllowed', 'radiologyAllowed',
    'isActive', 'notes'
  ];

  updatableFields.forEach(field => {
    if (data[field] !== undefined) {
      const newValue = data[field];
      const oldValue = existing[field];
      
      // Handle date comparison
      if (field === 'startDate' || field === 'endDate') {
        const newDate = newValue ? new Date(newValue).toISOString() : null;
        const oldDate = oldValue ? new Date(oldValue).toISOString() : null;
        if (newDate !== oldDate) {
          previousValues[field] = oldValue;
          newValues[field] = newValue;
        }
      } else if (newValue !== oldValue) {
        previousValues[field] = oldValue;
        newValues[field] = newValue;
      }
    }
  });

  return await prisma.$transaction(async (tx) => {
    const contract = await tx.debtorContract.update({
      where: { id: contractId },
      data: {
        ...data,
        contractNumber: data.contractNumber?.trim(),
        contractName: data.contractName?.trim(),
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : null,
        notes: data.notes?.trim(),
        updatedById: user?.id
      }
    });

    if (Object.keys(newValues).length > 0) {
      await tx.debtorAuditLog.create({
        data: {
          debtorAccountId: existing.debtorAccountId,
          actorId: user?.id,
          action: "CONTRACT_UPDATED",
          entityType: "DebtorContract",
          entityId: contract.id,
          previousValues,
          newValues,
          ipAddress: context.ipAddress,
          userAgent: context.userAgent
        }
      });
    }

    return contract;
  });
}

/**
 * Activate a debtor contract
 */
export async function activateDebtorContract(contractId, user, context = {}) {
  const { tenantId, branchId } = context;

  const existing = await prisma.debtorContract.findFirst({
    where: {
      id: contractId,
      debtorAccount: {
        tenantId,
        branchId: branchId || null
      }
    }
  });

  if (!existing) {
    throw new Error("Contract not found");
  }

  return await prisma.$transaction(async (tx) => {
    const contract = await tx.debtorContract.update({
      where: { id: contractId },
      data: {
        isActive: true,
        updatedById: user?.id
      }
    });

    await tx.debtorAuditLog.create({
      data: {
        debtorAccountId: existing.debtorAccountId,
        actorId: user?.id,
        action: "CONTRACT_ACTIVATED",
        entityType: "DebtorContract",
        entityId: contract.id,
        newValues: { isActive: true },
        ipAddress: context.ipAddress,
        userAgent: context.userAgent
      }
    });

    return contract;
  });
}

/**
 * Deactivate a debtor contract
 */
export async function deactivateDebtorContract(contractId, user, context = {}) {
  const { tenantId, branchId } = context;

  const existing = await prisma.debtorContract.findFirst({
    where: {
      id: contractId,
      debtorAccount: {
        tenantId,
        branchId: branchId || null
      }
    }
  });

  if (!existing) {
    throw new Error("Contract not found");
  }

  return await prisma.$transaction(async (tx) => {
    const contract = await tx.debtorContract.update({
      where: { id: contractId },
      data: {
        isActive: false,
        updatedById: user?.id
      }
    });

    await tx.debtorAuditLog.create({
      data: {
        debtorAccountId: existing.debtorAccountId,
        actorId: user?.id,
        action: "CONTRACT_DEACTIVATED",
        entityType: "DebtorContract",
        entityId: contract.id,
        newValues: { isActive: false },
        ipAddress: context.ipAddress,
        userAgent: context.userAgent
      }
    });

    return contract;
  });
}

/**
 * Get active contract for account at given date
 */
export async function getActiveContractForAccount(accountId, date = new Date(), tenantId, branchId) {
  const checkDate = date ? new Date(date) : new Date();

  return await prisma.debtorContract.findFirst({
    where: {
      debtorAccountId: accountId,
      isActive: true,
      debtorAccount: {
        tenantId,
        branchId: branchId || null
      },
      startDate: { lte: checkDate },
      OR: [
        { endDate: null },
        { endDate: { gte: checkDate } }
      ]
    },
    orderBy: { startDate: 'desc' }
  });
}

export default {
  createDebtorContract,
  getDebtorContracts,
  getDebtorContractById,
  updateDebtorContract,
  activateDebtorContract,
  deactivateDebtorContract,
  getActiveContractForAccount
};
