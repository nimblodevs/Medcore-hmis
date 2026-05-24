const debtorDocumentRepository = require('../repositories/debtor-document.repository');
const debtorAuditService = require('../services/debtor-audit.service');
const { AppError } = require('../../../utils/errors');
const { catchAsync } = require('../../../utils/catchAsync');

/**
 * Get all documents for a debtor account
 * GET /api/debtors/accounts/:accountId/documents
 */
const getDebtorDocuments = catchAsync(async (req, res, next) => {
  const { accountId } = req.params;
  const { documentType } = req.query;
  const tenantId = req.tenant?.id;

  const filters = {
    debtorAccountId: accountId,
    documentType,
  };

  const documents = await debtorDocumentRepository.findAll(filters, tenantId);

  res.json({
    success: true,
    message: 'Debtor documents retrieved successfully',
    data: documents,
  });
});

/**
 * Upload a new document for a debtor account
 * POST /api/debtors/accounts/:accountId/documents
 */
const uploadDebtorDocument = catchAsync(async (req, res, next) => {
  const { accountId } = req.params;
  const { documentType, fileName, fileUrl, mimeType, fileSize, notes } = req.body;
  
  const user = req.user;
  const tenantId = req.tenant?.id;

  if (!documentType || !fileName || !fileUrl) {
    throw new AppError('Document type, file name, and file URL are required', 400);
  }

  const document = await debtorDocumentRepository.create({
    debtorAccountId: accountId,
    documentType,
    fileName,
    fileUrl,
    mimeType,
    fileSize: fileSize ? parseInt(fileSize, 10) : null,
    notes,
    uploadedById: user.id,
    tenantId,
  });

  await debtorAuditService.log({
    debtorAccountId: accountId,
    actorId: user.id,
    action: 'DOCUMENT_UPLOADED',
    entityType: 'DebtorDocument',
    entityId: document.id,
    newValues: document,
    reason: `Document uploaded: ${fileName}`,
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
  });

  res.status(201).json({
    success: true,
    message: 'Document uploaded successfully',
    data: document,
  });
});

/**
 * Delete a debtor document
 * DELETE /api/debtors/documents/:id
 */
const deleteDebtorDocument = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const user = req.user;
  const tenantId = req.tenant?.id;

  const existingDocument = await debtorDocumentRepository.findById(id, tenantId);
  
  if (!existingDocument) {
    throw new AppError('Debtor document not found', 404);
  }

  await debtorDocumentRepository.delete(id);

  await debtorAuditService.log({
    debtorAccountId: existingDocument.debtorAccountId,
    actorId: user.id,
    action: 'DOCUMENT_DELETED',
    entityType: 'DebtorDocument',
    entityId: id,
    previousValues: existingDocument,
    newValues: null,
    reason: `Document deleted: ${existingDocument.fileName}`,
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
  });

  res.json({
    success: true,
    message: 'Document deleted successfully',
    data: null,
  });
});

module.exports = {
  getDebtorDocuments,
  uploadDebtorDocument,
  deleteDebtorDocument,
};
