import prisma from "../../../config/database.js";
import { generateDebtorCode, findDuplicateDebtor } from "../services/debtor-code.service.js";
import { createAuditLog } from "../services/debtor-audit.service.js";

/**
 * Create a new debtor account
 */
export async function createDebtorAccount(data, user, context = {}) {
  const { tenantId, branchId } = context;

  // Generate debtor code
  const debtorCode = await generateDebtorCode(data.debtorType);

  // Check for duplicates
  const duplicate = await findDuplicateDebtor(data.debtorName, data.debtorType);
  if (duplicate) {
    throw new Error(`A ${data.debtorType.toLowerCase()} debtor with name "${data.debtorName}" already exists`);
  }

  return await prisma.$transaction(async (tx) => {
    // Create the debtor account
    const account = await tx.debtorAccount.create({
      data: {
        tenantId,
        branchId,
        debtorCode,
        debtorName: data.debtorName.trim(),
        debtorType: data.debtorType,
        legalName: data.legalName?.trim(),
        taxPin: data.taxPin?.trim(),
        registrationNumber: data.registrationNumber?.trim(),
        email: data.email?.trim(),
        phone: data.phone?.trim(),
        website: data.website?.trim(),
        physicalAddress: data.physicalAddress?.trim(),
        postalAddress: data.postalAddress?.trim(),
        city: data.city?.trim(),
        country: data.country || "Kenya",
        creditLimit: data.creditLimit || 0,
        paymentTermsDays: data.paymentTermsDays || 30,
        billingCycle: data.billingCycle || "MONTHLY",
        requiresPreAuthorization: data.requiresPreAuthorization || false,
        allowsOutpatientBilling: data.allowsOutpatientBilling ?? true,
        allowsInpatientBilling: data.allowsInpatientBilling ?? true,
        allowsPharmacyBilling: data.allowsPharmacyBilling ?? true,
        allowsLabBilling: data.allowsLabBilling ?? true,
        allowsRadiologyBilling: data.allowsRadiologyBilling ?? true,
        accountManagerId: data.accountManagerId,
        claimsOfficerId: data.claimsOfficerId,
        notes: data.notes?.trim(),
        createdById: user?.id,
        updatedById: user?.id
      },
      include: {
        contacts: true,
        contracts: true
      }
    });

    // Create audit log
    await tx.debtorAuditLog.create({
      data: {
        debtorAccountId: account.id,
        actorId: user?.id,
        action: "ACCOUNT_CREATED",
        entityType: "DebtorAccount",
        entityId: account.id,
        newValues: {
          debtorCode: account.debtorCode,
          debtorName: account.debtorName,
          debtorType: account.debtorType,
          creditLimit: account.creditLimit
        },
        ipAddress: context.ipAddress,
        userAgent: context.userAgent
      }
    });

    return account;
  });
}

/**
 * Get all debtor accounts with filtering and pagination
 */
export async function getDebtorAccounts(filters = {}, pagination = {}, tenantId, branchId) {
  const {
    debtorType,
    status,
    search,
    minCreditLimit,
    maxCreditLimit
  } = filters;

  const { page = 1, limit = 20 } = pagination;
  const skip = (page - 1) * limit;

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

  if (search) {
    where.OR = [
      { debtorName: { contains: search, mode: 'insensitive' } },
      { debtorCode: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { taxPin: { contains: search, mode: 'insensitive' } }
    ];
  }

  if (minCreditLimit !== undefined) {
    where.creditLimit = { ...where.creditLimit, gte: minCreditLimit };
  }

  if (maxCreditLimit !== undefined) {
    where.creditLimit = { ...where.creditLimit, lte: maxCreditLimit };
  }

  const [accounts, total] = await Promise.all([
    prisma.debtorAccount.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: parseInt(limit),
      include: {
        contacts: {
          where: { isActive: true },
          take: 5
        },
        contracts: {
          where: { isActive: true },
          take: 5
        },
        _count: {
          select: {
            statements: true,
            reconciliations: true,
            documents: true
          }
        }
      }
    }),
    prisma.debtorAccount.count({ where })
  ]);

  return {
    data: accounts,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / parseInt(limit))
    }
  };
}

/**
 * Get a single debtor account by ID
 */
export async function getDebtorAccountById(id, tenantId, branchId) {
  const account = await prisma.debtorAccount.findFirst({
    where: {
      id,
      tenantId,
      branchId: branchId || null
    },
    include: {
      contacts: {
        orderBy: { createdAt: 'desc' }
      },
      contracts: {
        orderBy: { createdAt: 'desc' }
      },
      statements: {
        orderBy: { periodEnd: 'desc' },
        take: 10
      },
      reconciliations: {
        orderBy: { startedAt: 'desc' },
        take: 10
      },
      documents: {
        orderBy: { uploadedAt: 'desc' },
        take: 20
      },
      departmentRules: {
        where: { isActive: true }
      },
      outpatientLimits: {
        where: { isActive: true }
      },
      visitLimits: {
        where: { isActive: true }
      },
      copaymentRules: {
        where: { isActive: true }
      },
      auditLogs: {
        orderBy: { createdAt: 'desc' },
        take: 50
      }
    }
  });

  if (!account) {
    throw new Error("Debtor account not found");
  }

  return account;
}

/**
 * Update a debtor account
 */
export async function updateDebtorAccount(id, data, user, context = {}) {
  const { tenantId, branchId } = context;

  // Get existing account
  const existing = await prisma.debtorAccount.findFirst({
    where: {
      id,
      tenantId,
      branchId: branchId || null
    }
  });

  if (!existing) {
    throw new Error("Debtor account not found");
  }

  // Check for duplicate name if name is being changed
  if (data.debtorName && data.debtorName.trim() !== existing.debtorName) {
    const duplicate = await findDuplicateDebtor(data.debtorName.trim(), existing.debtorType, id);
    if (duplicate) {
      throw new Error(`A ${existing.debtorType.toLowerCase()} debtor with name "${data.debtorName.trim()}" already exists`);
    }
  }

  // Track changes for audit
  const previousValues = {};
  const newValues = {};

  const updatableFields = [
    'debtorName', 'legalName', 'taxPin', 'registrationNumber',
    'email', 'phone', 'website', 'physicalAddress', 'postalAddress',
    'city', 'country', 'creditLimit', 'paymentTermsDays', 'billingCycle',
    'requiresPreAuthorization', 'allowsOutpatientBilling', 'allowsInpatientBilling',
    'allowsPharmacyBilling', 'allowsLabBilling', 'allowsRadiologyBilling',
    'accountManagerId', 'claimsOfficerId', 'notes'
  ];

  updatableFields.forEach(field => {
    if (data[field] !== undefined) {
      if (data[field] !== existing[field]) {
        previousValues[field] = existing[field];
        newValues[field] = data[field];
      }
    }
  });

  return await prisma.$transaction(async (tx) => {
    const account = await tx.debtorAccount.update({
      where: { id },
      data: {
        ...data,
        debtorName: data.debtorName?.trim(),
        legalName: data.legalName?.trim(),
        taxPin: data.taxPin?.trim(),
        registrationNumber: data.registrationNumber?.trim(),
        email: data.email?.trim(),
        phone: data.phone?.trim(),
        website: data.website?.trim(),
        physicalAddress: data.physicalAddress?.trim(),
        postalAddress: data.postalAddress?.trim(),
        city: data.city?.trim(),
        notes: data.notes?.trim(),
        updatedById: user?.id
      },
      include: {
        contacts: true,
        contracts: true
      }
    });

    // Create audit log if there were changes
    if (Object.keys(newValues).length > 0) {
      await tx.debtorAuditLog.create({
        data: {
          debtorAccountId: account.id,
          actorId: user?.id,
          action: "ACCOUNT_UPDATED",
          entityType: "DebtorAccount",
          entityId: account.id,
          previousValues,
          newValues,
          ipAddress: context.ipAddress,
          userAgent: context.userAgent
        }
      });
    }

    return account;
  });
}

/**
 * Activate a debtor account
 */
export async function activateDebtorAccount(id, user, context = {}) {
  const { tenantId, branchId } = context;

  return await prisma.$transaction(async (tx) => {
    const account = await tx.debtorAccount.update({
      where: {
        id,
        tenantId,
        branchId: branchId || null
      },
      data: {
        status: "ACTIVE",
        activatedAt: new Date(),
        activatedById: user?.id
      }
    });

    await tx.debtorAuditLog.create({
      data: {
        debtorAccountId: account.id,
        actorId: user?.id,
        action: "ACCOUNT_ACTIVATED",
        entityType: "DebtorAccount",
        entityId: account.id,
        newValues: { status: "ACTIVE" },
        reason: context.reason,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent
      }
    });

    return account;
  });
}

/**
 * Put a debtor account on hold
 */
export async function holdDebtorAccount(id, reason, user, context = {}) {
  const { tenantId, branchId } = context;

  return await prisma.$transaction(async (tx) => {
    const account = await tx.debtorAccount.update({
      where: {
        id,
        tenantId,
        branchId: branchId || null
      },
      data: {
        status: "ON_HOLD",
        heldAt: new Date(),
        heldById: user?.id,
        holdReason: reason
      }
    });

    await tx.debtorAuditLog.create({
      data: {
        debtorAccountId: account.id,
        actorId: user?.id,
        action: "ACCOUNT_ON_HOLD",
        entityType: "DebtorAccount",
        entityId: account.id,
        newValues: { status: "ON_HOLD", holdReason: reason },
        reason,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent
      }
    });

    return account;
  });
}

/**
 * Release a debtor account from hold
 */
export async function releaseHoldDebtorAccount(id, user, context = {}) {
  const { tenantId, branchId } = context;

  return await prisma.$transaction(async (tx) => {
    const account = await tx.debtorAccount.update({
      where: {
        id,
        tenantId,
        branchId: branchId || null
      },
      data: {
        status: "ACTIVE",
        heldAt: null,
        heldById: null,
        holdReason: null
      }
    });

    await tx.debtorAuditLog.create({
      data: {
        debtorAccountId: account.id,
        actorId: user?.id,
        action: "ACCOUNT_RELEASED",
        entityType: "DebtorAccount",
        entityId: account.id,
        newValues: { status: "ACTIVE" },
        ipAddress: context.ipAddress,
        userAgent: context.userAgent
      }
    });

    return account;
  });
}

/**
 * Suspend a debtor account
 */
export async function suspendDebtorAccount(id, reason, user, context = {}) {
  const { tenantId, branchId } = context;

  return await prisma.$transaction(async (tx) => {
    const account = await tx.debtorAccount.update({
      where: {
        id,
        tenantId,
        branchId: branchId || null
      },
      data: {
        status: "SUSPENDED",
        suspendedAt: new Date(),
        suspendedById: user?.id,
        suspensionReason: reason
      }
    });

    await tx.debtorAuditLog.create({
      data: {
        debtorAccountId: account.id,
        actorId: user?.id,
        action: "ACCOUNT_SUSPENDED",
        entityType: "DebtorAccount",
        entityId: account.id,
        newValues: { status: "SUSPENDED", suspensionReason: reason },
        reason,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent
      }
    });

    return account;
  });
}

/**
 * Close a debtor account
 */
export async function closeDebtorAccount(id, reason, user, context = {}) {
  const { tenantId, branchId } = context;

  // Check if account has outstanding balance
  const account = await prisma.debtorAccount.findFirst({
    where: {
      id,
      tenantId,
      branchId: branchId || null
    }
  });

  if (!account) {
    throw new Error("Debtor account not found");
  }

  if (account.currentBalance > 0) {
    throw new Error("Cannot close account with outstanding balance. Please clear the balance first.");
  }

  return await prisma.$transaction(async (tx) => {
    const updatedAccount = await tx.debtorAccount.update({
      where: { id },
      data: {
        status: "CLOSED",
        closedAt: new Date(),
        closedById: user?.id,
        closureReason: reason
      }
    });

    await tx.debtorAuditLog.create({
      data: {
        debtorAccountId: account.id,
        actorId: user?.id,
        action: "ACCOUNT_CLOSED",
        entityType: "DebtorAccount",
        entityId: account.id,
        newValues: { status: "CLOSED", closureReason: reason },
        reason,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent
      }
    });

    return updatedAccount;
  });
}

/**
 * Archive a debtor account
 */
export async function archiveDebtorAccount(id, user, context = {}) {
  const { tenantId, branchId } = context;

  return await prisma.$transaction(async (tx) => {
    const account = await tx.debtorAccount.update({
      where: {
        id,
        tenantId,
        branchId: branchId || null
      },
      data: {
        status: "ARCHIVED"
      }
    });

    await tx.debtorAuditLog.create({
      data: {
        debtorAccountId: account.id,
        actorId: user?.id,
        action: "ACCOUNT_ARCHIVED",
        entityType: "DebtorAccount",
        entityId: account.id,
        newValues: { status: "ARCHIVED" },
        ipAddress: context.ipAddress,
        userAgent: context.userAgent
      }
    });

    return account;
  });
}

export default {
  createDebtorAccount,
  getDebtorAccounts,
  getDebtorAccountById,
  updateDebtorAccount,
  activateDebtorAccount,
  holdDebtorAccount,
  releaseHoldDebtorAccount,
  suspendDebtorAccount,
  closeDebtorAccount,
  archiveDebtorAccount
};
