const {
  createDebtorAccountSchema,
  updateDebtorAccountSchema,
  changeDebtorStatusSchema,
  holdDebtorAccountSchema,
  suspendDebtorAccountSchema,
  closeDebtorAccountSchema,
} = require('../validators/debtor-account.validator');
const debtorAccountRepository = require('../repositories/debtor-account.repository');
const debtorAuditService = require('../services/debtor-audit.service');
const { AppError } = require('../../../utils/errors');
const { catchAsync } = require('../../../utils/catchAsync');

/**
 * Create a new debtor account
 * POST /api/debtors/accounts
 */
const createDebtorAccount = catchAsync(async (req, res, next) => {
  const validatedData = await createDebtorAccountSchema.parseAsync(req.body);
  
  const user = req.user;
  const tenantId = req.tenant?.id;
  const branchId = req.branch?.id;

  const account = await debtorAccountRepository.create({
    ...validatedData,
    createdById: user.id,
    tenantId,
    branchId,
  });

  await debtorAuditService.log({
    debtorAccountId: account.id,
    actorId: user.id,
    action: 'ACCOUNT_CREATED',
    entityType: 'DebtorAccount',
    entityId: account.id,
    newValues: account,
    reason: 'New debtor account created',
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
  });

  res.status(201).json({
    success: true,
    message: 'Debtor account created successfully',
    data: account,
  });
});

/**
 * Get all debtor accounts with filtering and pagination
 * GET /api/debtors/accounts
 */
const getDebtorAccounts = catchAsync(async (req, res, next) => {
  const {
    page = 1,
    limit = 20,
    search,
    debtorType,
    status,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = req.query;

  const tenantId = req.tenant?.id;
  const branchId = req.branch?.id;

  const filters = {
    tenantId,
    branchId,
    search,
    debtorType,
    status,
  };

  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    sortBy,
    sortOrder,
  };

  const result = await debtorAccountRepository.findAll(filters, options);

  res.json({
    success: true,
    message: 'Debtor accounts retrieved successfully',
    data: result.accounts,
    pagination: result.pagination,
  });
});

/**
 * Get a single debtor account by ID
 * GET /api/debtors/accounts/:id
 */
const getDebtorAccountById = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const tenantId = req.tenant?.id;

  const account = await debtorAccountRepository.findById(id, tenantId);

  if (!account) {
    throw new AppError('Debtor account not found', 404);
  }

  res.json({
    success: true,
    message: 'Debtor account retrieved successfully',
    data: account,
  });
});

/**
 * Update a debtor account
 * PATCH /api/debtors/accounts/:id
 */
const updateDebtorAccount = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const validatedData = await updateDebtorAccountSchema.parseAsync(req.body);
  
  const user = req.user;
  const tenantId = req.tenant?.id;

  const existingAccount = await debtorAccountRepository.findById(id, tenantId);
  
  if (!existingAccount) {
    throw new AppError('Debtor account not found', 404);
  }

  const updatedAccount = await debtorAccountRepository.update(id, {
    ...validatedData,
    updatedById: user.id,
  });

  await debtorAuditService.log({
    debtorAccountId: id,
    actorId: user.id,
    action: 'ACCOUNT_UPDATED',
    entityType: 'DebtorAccount',
    entityId: id,
    previousValues: existingAccount,
    newValues: updatedAccount,
    reason: 'Debtor account updated',
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
  });

  res.json({
    success: true,
    message: 'Debtor account updated successfully',
    data: updatedAccount,
  });
});

/**
 * Activate a debtor account
 * POST /api/debtors/accounts/:id/activate
 */
const activateDebtorAccount = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const user = req.user;
  const tenantId = req.tenant?.id;

  const existingAccount = await debtorAccountRepository.findById(id, tenantId);
  
  if (!existingAccount) {
    throw new AppError('Debtor account not found', 404);
  }

  if (existingAccount.status === 'ACTIVE') {
    throw new AppError('Debtor account is already active', 400);
  }

  const activatedAccount = await debtorAccountRepository.activate(id, {
    activatedById: user.id,
  });

  await debtorAuditService.log({
    debtorAccountId: id,
    actorId: user.id,
    action: 'ACCOUNT_ACTIVATED',
    entityType: 'DebtorAccount',
    entityId: id,
    previousValues: { status: existingAccount.status },
    newValues: { status: 'ACTIVE' },
    reason: 'Debtor account activated',
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
  });

  res.json({
    success: true,
    message: 'Debtor account activated successfully',
    data: activatedAccount,
  });
});

/**
 * Put a debtor account on hold
 * POST /api/debtors/accounts/:id/hold
 */
const holdDebtorAccount = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const validatedData = await holdDebtorAccountSchema.parseAsync(req.body);
  
  const user = req.user;
  const tenantId = req.tenant?.id;

  const existingAccount = await debtorAccountRepository.findById(id, tenantId);
  
  if (!existingAccount) {
    throw new AppError('Debtor account not found', 404);
  }

  if (existingAccount.status !== 'ACTIVE') {
    throw new AppError('Only active accounts can be put on hold', 400);
  }

  const heldAccount = await debtorAccountRepository.hold(id, {
    heldById: user.id,
    holdReason: validatedData.holdReason,
  });

  await debtorAuditService.log({
    debtorAccountId: id,
    actorId: user.id,
    action: 'ACCOUNT_ON_HOLD',
    entityType: 'DebtorAccount',
    entityId: id,
    previousValues: { status: existingAccount.status, holdReason: null },
    newValues: { status: 'ON_HOLD', holdReason: validatedData.holdReason },
    reason: validatedData.holdReason || 'Debtor account placed on hold',
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
  });

  res.json({
    success: true,
    message: 'Debtor account placed on hold successfully',
    data: heldAccount,
  });
});

/**
 * Release a debtor account from hold
 * POST /api/debtors/accounts/:id/release-hold
 */
const releaseHoldDebtorAccount = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const user = req.user;
  const tenantId = req.tenant?.id;

  const existingAccount = await debtorAccountRepository.findById(id, tenantId);
  
  if (!existingAccount) {
    throw new AppError('Debtor account not found', 404);
  }

  if (existingAccount.status !== 'ON_HOLD') {
    throw new AppError('Account is not on hold', 400);
  }

  const releasedAccount = await debtorAccountRepository.releaseHold(id);

  await debtorAuditService.log({
    debtorAccountId: id,
    actorId: user.id,
    action: 'ACCOUNT_RELEASED',
    entityType: 'DebtorAccount',
    entityId: id,
    previousValues: { status: existingAccount.status, holdReason: existingAccount.holdReason },
    newValues: { status: 'ACTIVE', holdReason: null },
    reason: 'Hold released from debtor account',
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
  });

  res.json({
    success: true,
    message: 'Hold released from debtor account successfully',
    data: releasedAccount,
  });
});

/**
 * Suspend a debtor account
 * POST /api/debtors/accounts/:id/suspend
 */
const suspendDebtorAccount = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const validatedData = await suspendDebtorAccountSchema.parseAsync(req.body);
  
  const user = req.user;
  const tenantId = req.tenant?.id;

  const existingAccount = await debtorAccountRepository.findById(id, tenantId);
  
  if (!existingAccount) {
    throw new AppError('Debtor account not found', 404);
  }

  if (!['ACTIVE', 'ON_HOLD'].includes(existingAccount.status)) {
    throw new AppError('Only active or on-hold accounts can be suspended', 400);
  }

  const suspendedAccount = await debtorAccountRepository.suspend(id, {
    suspendedById: user.id,
    suspensionReason: validatedData.suspensionReason,
  });

  await debtorAuditService.log({
    debtorAccountId: id,
    actorId: user.id,
    action: 'ACCOUNT_SUSPENDED',
    entityType: 'DebtorAccount',
    entityId: id,
    previousValues: { status: existingAccount.status },
    newValues: { status: 'SUSPENDED', suspensionReason: validatedData.suspensionReason },
    reason: validatedData.suspensionReason || 'Debtor account suspended',
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
  });

  res.json({
    success: true,
    message: 'Debtor account suspended successfully',
    data: suspendedAccount,
  });
});

/**
 * Close a debtor account
 * POST /api/debtors/accounts/:id/close
 */
const closeDebtorAccount = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const validatedData = await closeDebtorAccountSchema.parseAsync(req.body);
  
  const user = req.user;
  const tenantId = req.tenant?.id;

  const existingAccount = await debtorAccountRepository.findById(id, tenantId);
  
  if (!existingAccount) {
    throw new AppError('Debtor account not found', 404);
  }

  if (existingAccount.currentBalance !== 0 && existingAccount.currentBalance !== '0') {
    throw new AppError('Cannot close account with outstanding balance', 400);
  }

  const closedAccount = await debtorAccountRepository.close(id, {
    closedById: user.id,
    closureReason: validatedData.closureReason,
  });

  await debtorAuditService.log({
    debtorAccountId: id,
    actorId: user.id,
    action: 'ACCOUNT_CLOSED',
    entityType: 'DebtorAccount',
    entityId: id,
    previousValues: { status: existingAccount.status },
    newValues: { status: 'CLOSED', closureReason: validatedData.closureReason },
    reason: validatedData.closureReason || 'Debtor account closed',
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
  });

  res.json({
    success: true,
    message: 'Debtor account closed successfully',
    data: closedAccount,
  });
});

/**
 * Archive a debtor account
 * POST /api/debtors/accounts/:id/archive
 */
const archiveDebtorAccount = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const user = req.user;
  const tenantId = req.tenant?.id;

  const existingAccount = await debtorAccountRepository.findById(id, tenantId);
  
  if (!existingAccount) {
    throw new AppError('Debtor account not found', 404);
  }

  if (existingAccount.status !== 'CLOSED') {
    throw new AppError('Only closed accounts can be archived', 400);
  }

  const archivedAccount = await debtorAccountRepository.archive(id);

  await debtorAuditService.log({
    debtorAccountId: id,
    actorId: user.id,
    action: 'ACCOUNT_ARCHIVED',
    entityType: 'DebtorAccount',
    entityId: id,
    previousValues: { status: existingAccount.status },
    newValues: { status: 'ARCHIVED' },
    reason: 'Debtor account archived',
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
  });

  res.json({
    success: true,
    message: 'Debtor account archived successfully',
    data: archivedAccount,
  });
});

module.exports = {
  createDebtorAccount,
  getDebtorAccounts,
  getDebtorAccountById,
  updateDebtorAccount,
  activateDebtorAccount,
  holdDebtorAccount,
  releaseHoldDebtorAccount,
  suspendDebtorAccount,
  closeDebtorAccount,
  archiveDebtorAccount,
};
