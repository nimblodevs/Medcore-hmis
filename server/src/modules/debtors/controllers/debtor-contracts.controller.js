const {
  createDebtorContractSchema,
  updateDebtorContractSchema,
} = require('../validators/debtor-contract.validator');
const debtorContractRepository = require('../repositories/debtor-contract.repository');
const debtorAuditService = require('../services/debtor-audit.service');
const { AppError } = require('../../../utils/errors');
const { catchAsync } = require('../../../utils/catchAsync');

/**
 * Get all contracts for a debtor account
 * GET /api/debtors/accounts/:accountId/contracts
 */
const getDebtorContracts = catchAsync(async (req, res, _next) => {
  const { accountId } = req.params;
  const { isActive } = req.query;
  const tenantId = req.tenant?.id;

  const filters = {
    debtorAccountId: accountId,
    isActive: isActive !== undefined ? isActive === 'true' : undefined,
  };

  const contracts = await debtorContractRepository.findAll(filters, tenantId);

  res.json({
    success: true,
    message: 'Debtor contracts retrieved successfully',
    data: contracts,
  });
});

/**
 * Create a new contract for a debtor account
 * POST /api/debtors/accounts/:accountId/contracts
 */
const createDebtorContract = catchAsync(async (req, res, _next) => {
  const { accountId } = req.params;
  const validatedData = await createDebtorContractSchema.parseAsync(req.body);
  
  const user = req.user;
  const tenantId = req.tenant?.id;

  const contract = await debtorContractRepository.create({
    ...validatedData,
    debtorAccountId: accountId,
    createdById: user.id,
    tenantId,
  });

  await debtorAuditService.log({
    debtorAccountId: accountId,
    actorId: user.id,
    action: 'CONTRACT_CREATED',
    entityType: 'DebtorContract',
    entityId: contract.id,
    newValues: contract,
    reason: 'New contract created for debtor account',
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
  });

  res.status(201).json({
    success: true,
    message: 'Debtor contract created successfully',
    data: contract,
  });
});

/**
 * Update a debtor contract
 * PATCH /api/debtors/contracts/:id
 */
const updateDebtorContract = catchAsync(async (req, res, _next) => {
  const { id } = req.params;
  const validatedData = await updateDebtorContractSchema.parseAsync(req.body);
  
  const user = req.user;
  const tenantId = req.tenant?.id;

  const existingContract = await debtorContractRepository.findById(id, tenantId);
  
  if (!existingContract) {
    throw new AppError('Debtor contract not found', 404);
  }

  const updatedContract = await debtorContractRepository.update(id, {
    ...validatedData,
    updatedById: user.id,
  });

  await debtorAuditService.log({
    debtorAccountId: existingContract.debtorAccountId,
    actorId: user.id,
    action: 'CONTRACT_UPDATED',
    entityType: 'DebtorContract',
    entityId: id,
    previousValues: existingContract,
    newValues: updatedContract,
    reason: 'Debtor contract updated',
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
  });

  res.json({
    success: true,
    message: 'Debtor contract updated successfully',
    data: updatedContract,
  });
});

/**
 * Activate a debtor contract
 * POST /api/debtors/contracts/:id/activate
 */
const activateDebtorContract = catchAsync(async (req, res, _next) => {
  const { id } = req.params;
  const user = req.user;
  const tenantId = req.tenant?.id;

  const existingContract = await debtorContractRepository.findById(id, tenantId);
  
  if (!existingContract) {
    throw new AppError('Debtor contract not found', 404);
  }

  if (existingContract.isActive) {
    throw new AppError('Contract is already active', 400);
  }

  const activatedContract = await debtorContractRepository.activate(id, {
    updatedById: user.id,
  });

  await debtorAuditService.log({
    debtorAccountId: existingContract.debtorAccountId,
    actorId: user.id,
    action: 'CONTRACT_ACTIVATED',
    entityType: 'DebtorContract',
    entityId: id,
    previousValues: { isActive: false },
    newValues: { isActive: true },
    reason: 'Debtor contract activated',
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
  });

  res.json({
    success: true,
    message: 'Debtor contract activated successfully',
    data: activatedContract,
  });
});

/**
 * Deactivate a debtor contract
 * POST /api/debtors/contracts/:id/deactivate
 */
const deactivateDebtorContract = catchAsync(async (req, res, _next) => {
  const { id } = req.params;
  const user = req.user;
  const tenantId = req.tenant?.id;

  const existingContract = await debtorContractRepository.findById(id, tenantId);
  
  if (!existingContract) {
    throw new AppError('Debtor contract not found', 404);
  }

  if (!existingContract.isActive) {
    throw new AppError('Contract is already inactive', 400);
  }

  const deactivatedContract = await debtorContractRepository.deactivate(id, {
    updatedById: user.id,
  });

  await debtorAuditService.log({
    debtorAccountId: existingContract.debtorAccountId,
    actorId: user.id,
    action: 'CONTRACT_DEACTIVATED',
    entityType: 'DebtorContract',
    entityId: id,
    previousValues: { isActive: true },
    newValues: { isActive: false },
    reason: 'Debtor contract deactivated',
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
  });

  res.json({
    success: true,
    message: 'Debtor contract deactivated successfully',
    data: deactivatedContract,
  });
});

module.exports = {
  getDebtorContracts,
  createDebtorContract,
  updateDebtorContract,
  activateDebtorContract,
  deactivateDebtorContract,
};
