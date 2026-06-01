import prisma from "../../../config/database.js";

/**
 * Create a new debtor contact
 */
export async function createDebtorContact(accountId, data, user, context = {}) {
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

  // If this is marked as primary, deactivate other primary contacts of same type
  if (data.isPrimary) {
    await prisma.debtorContact.updateMany({
      where: {
        debtorAccountId: accountId,
        contactType: data.contactType || "GENERAL",
        isPrimary: true
      },
      data: { isPrimary: false }
    });
  }

  return await prisma.$transaction(async (tx) => {
    const contact = await tx.debtorContact.create({
      data: {
        debtorAccountId: accountId,
        contactType: data.contactType || "GENERAL",
        fullName: data.fullName.trim(),
        jobTitle: data.jobTitle?.trim(),
        phone: data.phone?.trim(),
        email: data.email?.trim(),
        isPrimary: data.isPrimary || false,
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
        action: "CONTACT_CREATED",
        entityType: "DebtorContact",
        entityId: contact.id,
        newValues: {
          fullName: contact.fullName,
          contactType: contact.contactType,
          email: contact.email,
          phone: contact.phone
        },
        ipAddress: context.ipAddress,
        userAgent: context.userAgent
      }
    });

    return contact;
  });
}

/**
 * Get all contacts for a debtor account
 */
export async function getDebtorContacts(accountId, filters = {}, tenantId, branchId) {
  const { contactType, isActive } = filters;

  const where = {
    debtorAccountId: accountId,
    debtorAccount: {
      tenantId,
      branchId: branchId || null
    }
  };

  if (contactType) {
    where.contactType = contactType;
  }

  if (isActive !== undefined) {
    where.isActive = isActive;
  }

  return await prisma.debtorContact.findMany({
    where,
    orderBy: [{ isPrimary: 'desc' }, { createdAt: 'desc' }]
  });
}

/**
 * Get a single contact by ID
 */
export async function getDebtorContactById(contactId, tenantId, branchId) {
  const contact = await prisma.debtorContact.findFirst({
    where: {
      id: contactId,
      debtorAccount: {
        tenantId,
        branchId: branchId || null
      }
    }
  });

  if (!contact) {
    throw new Error("Contact not found");
  }

  return contact;
}

/**
 * Update a debtor contact
 */
export async function updateDebtorContact(contactId, data, user, context = {}) {
  const { tenantId, branchId } = context;

  // Get existing contact
  const existing = await prisma.debtorContact.findFirst({
    where: {
      id: contactId,
      debtorAccount: {
        tenantId,
        branchId: branchId || null
      }
    }
  });

  if (!existing) {
    throw new Error("Contact not found");
  }

  // If setting as primary, deactivate other primaries of same type
  if (data.isPrimary && !existing.isPrimary) {
    await prisma.debtorContact.updateMany({
      where: {
        debtorAccountId: existing.debtorAccountId,
        contactType: existing.contactType,
        isPrimary: true,
        id: { not: contactId }
      },
      data: { isPrimary: false }
    });
  }

  // Track changes for audit
  const previousValues = {};
  const newValues = {};

  const updatableFields = [
    'contactType', 'fullName', 'jobTitle', 'phone', 'email',
    'isPrimary', 'isActive', 'notes'
  ];

  updatableFields.forEach(field => {
    if (data[field] !== undefined && data[field] !== existing[field]) {
      previousValues[field] = existing[field];
      newValues[field] = data[field];
    }
  });

  return await prisma.$transaction(async (tx) => {
    const contact = await tx.debtorContact.update({
      where: { id: contactId },
      data: {
        ...data,
        fullName: data.fullName?.trim(),
        jobTitle: data.jobTitle?.trim(),
        phone: data.phone?.trim(),
        email: data.email?.trim(),
        notes: data.notes?.trim(),
        updatedById: user?.id
      }
    });

    if (Object.keys(newValues).length > 0) {
      await tx.debtorAuditLog.create({
        data: {
          debtorAccountId: existing.debtorAccountId,
          actorId: user?.id,
          action: "CONTACT_UPDATED",
          entityType: "DebtorContact",
          entityId: contact.id,
          previousValues,
          newValues,
          ipAddress: context.ipAddress,
          userAgent: context.userAgent
        }
      });
    }

    return contact;
  });
}

/**
 * Deactivate a debtor contact
 */
export async function deactivateDebtorContact(contactId, user, context = {}) {
  const { tenantId, branchId } = context;

  const existing = await prisma.debtorContact.findFirst({
    where: {
      id: contactId,
      debtorAccount: {
        tenantId,
        branchId: branchId || null
      }
    }
  });

  if (!existing) {
    throw new Error("Contact not found");
  }

  return await prisma.$transaction(async (tx) => {
    const contact = await tx.debtorContact.update({
      where: { id: contactId },
      data: {
        isActive: false,
        updatedById: user?.id
      }
    });

    await tx.debtorAuditLog.create({
      data: {
        debtorAccountId: existing.debtorAccountId,
        actorId: user?.id,
        action: "CONTACT_DEACTIVATED",
        entityType: "DebtorContact",
        entityId: contact.id,
        newValues: { isActive: false },
        ipAddress: context.ipAddress,
        userAgent: context.userAgent
      }
    });

    return contact;
  });
}

export default {
  createDebtorContact,
  getDebtorContacts,
  getDebtorContactById,
  updateDebtorContact,
  deactivateDebtorContact
};
