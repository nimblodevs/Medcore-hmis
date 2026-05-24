import prisma from "../../../config/database.js";
import { createAuditLog } from "../services/debtor-audit.service.js";

/**
 * Upload a document for a debtor account
 */
export async function uploadDebtorDocument(accountId, data, user, context = {}) {
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

  return await prisma.$transaction(async (tx) => {
    const document = await tx.debtorDocument.create({
      data: {
        debtorAccountId: accountId,
        documentType: data.documentType,
        fileName: data.fileName.trim(),
        fileUrl: data.fileUrl.trim(),
        mimeType: data.mimeType,
        fileSize: data.fileSize,
        notes: data.notes?.trim(),
        uploadedById: user?.id
      }
    });

    await tx.debtorAuditLog.create({
      data: {
        debtorAccountId: accountId,
        actorId: user?.id,
        action: "DOCUMENT_UPLOADED",
        entityType: "DebtorDocument",
        entityId: document.id,
        newValues: {
          documentType: document.documentType,
          fileName: document.fileName,
          fileUrl: document.fileUrl
        },
        ipAddress: context.ipAddress,
        userAgent: context.userAgent
      }
    });

    return document;
  });
}

/**
 * Get all documents for a debtor account
 */
export async function getDebtorDocuments(accountId, filters = {}, tenantId, branchId) {
  const { documentType } = filters;

  const where = {
    debtorAccountId: accountId,
    debtorAccount: {
      tenantId,
      branchId: branchId || null
    }
  };

  if (documentType) {
    where.documentType = documentType;
  }

  return await prisma.debtorDocument.findMany({
    where,
    orderBy: { uploadedAt: 'desc' }
  });
}

/**
 * Get a single document by ID
 */
export async function getDebtorDocumentById(documentId, tenantId, branchId) {
  const document = await prisma.debtorDocument.findFirst({
    where: {
      id: documentId,
      debtorAccount: {
        tenantId,
        branchId: branchId || null
      }
    }
  });

  if (!document) {
    throw new Error("Document not found");
  }

  return document;
}

/**
 * Delete a debtor document
 */
export async function deleteDebtorDocument(documentId, user, context = {}) {
  const { tenantId, branchId } = context;

  const existing = await prisma.debtorDocument.findFirst({
    where: {
      id: documentId,
      debtorAccount: {
        tenantId,
        branchId: branchId || null
      }
    }
  });

  if (!existing) {
    throw new Error("Document not found");
  }

  await prisma.debtorDocument.delete({
    where: { id: documentId }
  });

  await prisma.debtorAuditLog.create({
    data: {
      debtorAccountId: existing.debtorAccountId,
      actorId: user?.id,
      action: "DOCUMENT_DELETED",
      entityType: "DebtorDocument",
      entityId: documentId,
      newValues: {
        documentType: existing.documentType,
        fileName: existing.fileName
      },
      ipAddress: context.ipAddress,
      userAgent: context.userAgent
    }
  });

  return { success: true, message: "Document deleted successfully" };
}

export default {
  uploadDebtorDocument,
  getDebtorDocuments,
  getDebtorDocumentById,
  deleteDebtorDocument
};
