const debtorReconciliationRepository = require('../repositories/debtor-reconciliation.repository');
const debtorAuditService = require('../services/debtor-audit.service');
const { AppError } = require('../../../utils/errors');
const { catchAsync } = require('../../../utils/catchAsync');

/**
 * Get all reconciliations for a debtor account
 * GET /api/debtors/accounts/:accountId/reconciliations
 */
const getDebtorReconciliations = catchAsync(async (req, res, _next) => {
  const { accountId } = req.params;
  const { status } = req.query;
  const tenantId = req.tenant?.id;

  const filters = {
    debtorAccountId: accountId,
    status,
  };

  const reconciliations = await debtorReconciliationRepository.findAll(filters, tenantId);

  res.json({
    success: true,
    message: 'Debtor reconciliations retrieved successfully',
    data: reconciliations,
  });
});

/**
 * Create a new reconciliation for a debtor account
 * POST /api/debtors/accounts/:accountId/reconciliations
 */
const createDebtorReconciliation = catchAsync(async (req, res, _next) => {
  const { accountId } = req.params;
  const {
    statementId,
    paymentReference,
    remittanceReference,
    remittanceAmount,
    notes,
  } = req.body;
  
  const user = req.user;
  const tenantId = req.tenant?.id;

  const reconciliation = await debtorReconciliationRepository.create({
    debtorAccountId: accountId,
    statementId,
    paymentReference,
    remittanceReference,
    remittanceAmount: remittanceAmount ? parseFloat(remittanceAmount) : null,
    notes,
    startedById: user.id,
    tenantId,
  });

  await debtorAuditService.log({
    debtorAccountId: accountId,
    actorId: user.id,
    action: 'RECONCILIATION_CREATED',
    entityType: 'DebtorReconciliation',
    entityId: reconciliation.id,
    newValues: reconciliation,
    reason: 'New reconciliation created for debtor account',
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
  });

  res.status(201).json({
    success: true,
    message: 'Debtor reconciliation created successfully',
    data: reconciliation,
  });
});

/**
 * Get a single reconciliation by ID
 * GET /api/debtors/reconciliations/:id
 */
const getDebtorReconciliationById = catchAsync(async (req, res, _next) => {
  const { id } = req.params;
  const tenantId = req.tenant?.id;

  const reconciliation = await debtorReconciliationRepository.findById(id, tenantId);

  if (!reconciliation) {
    throw new AppError('Debtor reconciliation not found', 404);
  }

  res.json({
    success: true,
    message: 'Debtor reconciliation retrieved successfully',
    data: reconciliation,
  });
});

/**
 * Update a reconciliation (matched/unmatched amounts)
 * PATCH /api/debtors/reconciliations/:id
 */
const updateDebtorReconciliation = catchAsync(async (req, res, _next) => {
  const { id } = req.params;
  const { matchedAmount, unmatchedAmount, notes } = req.body;
  
  const user = req.user;
  const tenantId = req.tenant?.id;

  const existingReconciliation = await debtorReconciliationRepository.findById(id, tenantId);
  
  if (!existingReconciliation) {
    throw new AppError('Debtor reconciliation not found', 404);
  }

  const updateData = {};
  if (matchedAmount !== undefined) {
    updateData.matchedAmount = parseFloat(matchedAmount);
  }
  if (unmatchedAmount !== undefined) {
    updateData.unmatchedAmount = parseFloat(unmatchedAmount);
  }
  if (notes !== undefined) {
    updateData.notes = notes;
  }
  updateData.updatedById = user.id;

  const updatedReconciliation = await debtorReconciliationRepository.update(id, updateData);

  await debtorAuditService.log({
    debtorAccountId: existingReconciliation.debtorAccountId,
    actorId: user.id,
    action: 'RECONCILIATION_UPDATED',
    entityType: 'DebtorReconciliation',
    entityId: id,
    previousValues: {
      matchedAmount: existingReconciliation.matchedAmount,
      unmatchedAmount: existingReconciliation.unmatchedAmount,
    },
    newValues: updateData,
    reason: 'Reconciliation updated',
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
  });

  res.json({
    success: true,
    message: 'Debtor reconciliation updated successfully',
    data: updatedReconciliation,
  });
});

/**
 * Close a reconciliation
 * POST /api/debtors/reconciliations/:id/close
 */
const closeDebtorReconciliation = catchAsync(async (req, res, _next) => {
  const { id } = req.params;
  const user = req.user;
  const tenantId = req.tenant?.id;

  const existingReconciliation = await debtorReconciliationRepository.findById(id, tenantId);
  
  if (!existingReconciliation) {
    throw new AppError('Debtor reconciliation not found', 404);
  }

  if (['CLOSED', 'CANCELLED'].includes(existingReconciliation.status)) {
    throw new AppError('Reconciliation is already closed or cancelled', 400);
  }

  const closedReconciliation = await debtorReconciliationRepository.close(id, {
    closedById: user.id,
  });

  await debtorAuditService.log({
    debtorAccountId: existingReconciliation.debtorAccountId,
    actorId: user.id,
    action: 'RECONCILIATION_CLOSED',
    entityType: 'DebtorReconciliation',
    entityId: id,
    previousValues: { status: existingReconciliation.status },
    newValues: { status: 'CLOSED', closedAt: new Date() },
    reason: 'Reconciliation closed',
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
  });

  res.json({
    success: true,
    message: 'Debtor reconciliation closed successfully',
    data: closedReconciliation,
  });
});

module.exports = {
  getDebtorReconciliations,
  createDebtorReconciliation,
  getDebtorReconciliationById,
  updateDebtorReconciliation,
  closeDebtorReconciliation,
};
