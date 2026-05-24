const debtorStatementRepository = require('../repositories/debtor-statement.repository');
const debtorAuditService = require('../services/debtor-audit.service');
const { AppError } = require('../../../utils/errors');
const { catchAsync } = require('../../../utils/catchAsync');

/**
 * Get all statements for a debtor account
 * GET /api/debtors/accounts/:accountId/statements
 */
const getDebtorStatements = catchAsync(async (req, res, next) => {
  const { accountId } = req.params;
  const { status, periodStart, periodEnd } = req.query;
  const tenantId = req.tenant?.id;

  const filters = {
    debtorAccountId: accountId,
    status,
    periodStart,
    periodEnd,
  };

  const statements = await debtorStatementRepository.findAll(filters, tenantId);

  res.json({
    success: true,
    message: 'Debtor statements retrieved successfully',
    data: statements,
  });
});

/**
 * Generate a new statement for a debtor account
 * POST /api/debtors/accounts/:accountId/statements/generate
 */
const generateDebtorStatement = catchAsync(async (req, res, next) => {
  const { accountId } = req.params;
  const { periodStart, periodEnd } = req.body;
  
  const user = req.user;
  const tenantId = req.tenant?.id;

  if (!periodStart || !periodEnd) {
    throw new AppError('Period start and end dates are required', 400);
  }

  const statement = await debtorStatementRepository.generate({
    debtorAccountId: accountId,
    periodStart: new Date(periodStart),
    periodEnd: new Date(periodEnd),
    generatedById: user.id,
    tenantId,
  });

  await debtorAuditService.log({
    debtorAccountId: accountId,
    actorId: user.id,
    action: 'STATEMENT_GENERATED',
    entityType: 'DebtorStatement',
    entityId: statement.id,
    newValues: statement,
    reason: 'New statement generated for debtor account',
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
  });

  res.status(201).json({
    success: true,
    message: 'Debtor statement generated successfully',
    data: statement,
  });
});

/**
 * Get a single statement by ID
 * GET /api/debtors/statements/:id
 */
const getDebtorStatementById = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const tenantId = req.tenant?.id;

  const statement = await debtorStatementRepository.findById(id, tenantId);

  if (!statement) {
    throw new AppError('Debtor statement not found', 404);
  }

  res.json({
    success: true,
    message: 'Debtor statement retrieved successfully',
    data: statement,
  });
});

/**
 * Mark a statement as sent
 * POST /api/debtors/statements/:id/mark-sent
 */
const markStatementAsSent = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const user = req.user;
  const tenantId = req.tenant?.id;

  const existingStatement = await debtorStatementRepository.findById(id, tenantId);
  
  if (!existingStatement) {
    throw new AppError('Debtor statement not found', 404);
  }

  const updatedStatement = await debtorStatementRepository.markAsSent(id, {
    sentById: user.id,
  });

  await debtorAuditService.log({
    debtorAccountId: existingStatement.debtorAccountId,
    actorId: user.id,
    action: 'STATEMENT_SENT',
    entityType: 'DebtorStatement',
    entityId: id,
    previousValues: { status: existingStatement.status, sentAt: null },
    newValues: { status: 'SENT', sentAt: new Date() },
    reason: 'Statement marked as sent',
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
  });

  res.json({
    success: true,
    message: 'Statement marked as sent successfully',
    data: updatedStatement,
  });
});

/**
 * Acknowledge a statement
 * POST /api/debtors/statements/:id/acknowledge
 */
const acknowledgeStatement = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const user = req.user;
  const tenantId = req.tenant?.id;

  const existingStatement = await debtorStatementRepository.findById(id, tenantId);
  
  if (!existingStatement) {
    throw new AppError('Debtor statement not found', 404);
  }

  const updatedStatement = await debtorStatementRepository.acknowledge(id, {
    acknowledgedById: user.id,
  });

  await debtorAuditService.log({
    debtorAccountId: existingStatement.debtorAccountId,
    actorId: user.id,
    action: 'STATEMENT_ACKNOWLEDGED',
    entityType: 'DebtorStatement',
    entityId: id,
    previousValues: { status: existingStatement.status },
    newValues: { status: 'ACKNOWLEDGED', acknowledgedAt: new Date() },
    reason: 'Statement acknowledged',
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
  });

  res.json({
    success: true,
    message: 'Statement acknowledged successfully',
    data: updatedStatement,
  });
});

/**
 * Dispute a statement
 * POST /api/debtors/statements/:id/dispute
 */
const disputeStatement = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { disputeReason } = req.body;
  
  const user = req.user;
  const tenantId = req.tenant?.id;

  if (!disputeReason) {
    throw new AppError('Dispute reason is required', 400);
  }

  const existingStatement = await debtorStatementRepository.findById(id, tenantId);
  
  if (!existingStatement) {
    throw new AppError('Debtor statement not found', 404);
  }

  const updatedStatement = await debtorStatementRepository.dispute(id, {
    disputedById: user.id,
    disputeReason,
  });

  await debtorAuditService.log({
    debtorAccountId: existingStatement.debtorAccountId,
    actorId: user.id,
    action: 'STATEMENT_DISPUTED',
    entityType: 'DebtorStatement',
    entityId: id,
    previousValues: { status: existingStatement.status, disputeReason: null },
    newValues: { status: 'DISPUTED', disputeReason, disputedAt: new Date() },
    reason: `Statement disputed: ${disputeReason}`,
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
  });

  res.json({
    success: true,
    message: 'Statement disputed successfully',
    data: updatedStatement,
  });
});

module.exports = {
  getDebtorStatements,
  generateDebtorStatement,
  getDebtorStatementById,
  markStatementAsSent,
  acknowledgeStatement,
  disputeStatement,
};
