const debtorBalanceRepository = require('../repositories/debtor-balance.repository');
const { AppError } = require('../../../utils/errors');
const { catchAsync } = require('../../../utils/catchAsync');

/**
 * Get current balance for a debtor account
 * GET /api/debtors/accounts/:accountId/balance
 */
const getDebtorBalance = catchAsync(async (req, res, _next) => {
  const { accountId } = req.params;
  const tenantId = req.tenant?.id;

  const balance = await debtorBalanceRepository.getCurrentBalance(accountId, tenantId);

  if (!balance) {
    throw new AppError('Debtor account not found', 404);
  }

  res.json({
    success: true,
    message: 'Debtor balance retrieved successfully',
    data: balance,
  });
});

/**
 * Recalculate balance for a debtor account
 * POST /api/debtors/accounts/:accountId/recalculate-balance
 */
const recalculateDebtorBalance = catchAsync(async (req, res, _next) => {
  const { accountId } = req.params;
  const user = req.user;
  const tenantId = req.tenant?.id;

  const balance = await debtorBalanceRepository.recalculateBalance(accountId, {
    userId: user.id,
    tenantId,
  });

  if (!balance) {
    throw new AppError('Debtor account not found', 404);
  }

  res.json({
    success: true,
    message: 'Debtor balance recalculated successfully',
    data: balance,
  });
});

/**
 * Get aging report for a debtor account
 * GET /api/debtors/accounts/:accountId/aging
 */
const getDebtorAging = catchAsync(async (req, res, _next) => {
  const { accountId } = req.params;
  const { asOfDate } = req.query;
  const tenantId = req.tenant?.id;

  const aging = await debtorBalanceRepository.getAging(accountId, {
    asOfDate: asOfDate ? new Date(asOfDate) : new Date(),
    tenantId,
  });

  if (!aging) {
    throw new AppError('Debtor account not found', 404);
  }

  res.json({
    success: true,
    message: 'Debtor aging retrieved successfully',
    data: aging,
  });
});

/**
 * Get aging summary for all debtors or filtered by type
 * GET /api/debtors/aging/summary
 */
const getAgingSummary = catchAsync(async (req, res, _next) => {
  const { debtorType, status } = req.query;
  const { asOfDate } = req.query;
  const tenantId = req.tenant?.id;

  const filters = {
    debtorType,
    status,
  };

  const summary = await debtorBalanceRepository.getAgingSummary({
    ...filters,
    asOfDate: asOfDate ? new Date(asOfDate) : new Date(),
    tenantId,
  });

  res.json({
    success: true,
    message: 'Aging summary retrieved successfully',
    data: summary,
  });
});

module.exports = {
  getDebtorBalance,
  recalculateDebtorBalance,
  getDebtorAging,
  getAgingSummary,
};
