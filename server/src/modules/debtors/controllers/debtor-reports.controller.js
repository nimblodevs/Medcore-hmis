const debtorReportRepository = require('../repositories/debtor-report.repository');
const { AppError } = require('../../../utils/errors');
const { catchAsync } = require('../../../utils/catchAsync');

/**
 * Get debtor summary report
 * GET /api/debtors/reports/summary
 */
const getDebtorSummaryReport = catchAsync(async (req, res, next) => {
  const { debtorType, status, startDate, endDate } = req.query;
  const tenantId = req.tenant?.id;

  const filters = {
    debtorType,
    status,
    startDate,
    endDate,
  };

  const report = await debtorReportRepository.getSummaryReport(filters, tenantId);

  res.json({
    success: true,
    message: 'Debtor summary report retrieved successfully',
    data: report,
  });
});

/**
 * Get outstanding report by debtor type
 * GET /api/debtors/reports/outstanding
 */
const getOutstandingReport = catchAsync(async (req, res, next) => {
  const { debtorType, status } = req.query;
  const tenantId = req.tenant?.id;

  const filters = {
    debtorType,
    status,
  };

  const report = await debtorReportRepository.getOutstandingReport(filters, tenantId);

  res.json({
    success: true,
    message: 'Outstanding report retrieved successfully',
    data: report,
  });
});

/**
 * Get aging report
 * GET /api/debtors/reports/aging
 */
const getAgingReport = catchAsync(async (req, res, next) => {
  const { debtorType, status, asOfDate } = req.query;
  const tenantId = req.tenant?.id;

  const filters = {
    debtorType,
    status,
    asOfDate: asOfDate ? new Date(asOfDate) : new Date(),
  };

  const report = await debtorReportRepository.getAgingReport(filters, tenantId);

  res.json({
    success: true,
    message: 'Aging report retrieved successfully',
    data: report,
  });
});

/**
 * Get credit limits report
 * GET /api/debtors/reports/credit-limits
 */
const getCreditLimitsReport = catchAsync(async (req, res, next) => {
  const { debtorType, status, overLimitOnly } = req.query;
  const tenantId = req.tenant?.id;

  const filters = {
    debtorType,
    status,
    overLimitOnly: overLimitOnly === 'true',
  };

  const report = await debtorReportRepository.getCreditLimitsReport(filters, tenantId);

  res.json({
    success: true,
    message: 'Credit limits report retrieved successfully',
    data: report,
  });
});

/**
 * Get statements report
 * GET /api/debtors/reports/statements
 */
const getStatementsReport = catchAsync(async (req, res, next) => {
  const { status, periodStart, periodEnd, debtorType } = req.query;
  const tenantId = req.tenant?.id;

  const filters = {
    status,
    periodStart,
    periodEnd,
    debtorType,
  };

  const report = await debtorReportRepository.getStatementsReport(filters, tenantId);

  res.json({
    success: true,
    message: 'Statements report retrieved successfully',
    data: report,
  });
});

/**
 * Get reconciliations report
 * GET /api/debtors/reports/reconciliations
 */
const getReconciliationsReport = catchAsync(async (req, res, next) => {
  const { status, periodStart, periodEnd } = req.query;
  const tenantId = req.tenant?.id;

  const filters = {
    status,
    periodStart,
    periodEnd,
  };

  const report = await debtorReportRepository.getReconciliationsReport(filters, tenantId);

  res.json({
    success: true,
    message: 'Reconciliations report retrieved successfully',
    data: report,
  });
});

/**
 * Get SHA specific report
 * GET /api/debtors/reports/sha
 */
const getShaReport = catchAsync(async (req, res, next) => {
  const { status, asOfDate } = req.query;
  const tenantId = req.tenant?.id;

  const filters = {
    status,
    asOfDate: asOfDate ? new Date(asOfDate) : new Date(),
  };

  const report = await debtorReportRepository.getShaReport(filters, tenantId);

  res.json({
    success: true,
    message: 'SHA report retrieved successfully',
    data: report,
  });
});

/**
 * Get insurance specific report
 * GET /api/debtors/reports/insurance
 */
const getInsuranceReport = catchAsync(async (req, res, next) => {
  const { status, asOfDate } = req.query;
  const tenantId = req.tenant?.id;

  const filters = {
    status,
    asOfDate: asOfDate ? new Date(asOfDate) : new Date(),
  };

  const report = await debtorReportRepository.getInsuranceReport(filters, tenantId);

  res.json({
    success: true,
    message: 'Insurance report retrieved successfully',
    data: report,
  });
});

/**
 * Get corporate specific report
 * GET /api/debtors/reports/corporates
 */
const getCorporateReport = catchAsync(async (req, res, next) => {
  const { status, asOfDate, includeDirectCorporate } = req.query;
  const tenantId = req.tenant?.id;

  const filters = {
    status,
    asOfDate: asOfDate ? new Date(asOfDate) : new Date(),
    includeDirectCorporate: includeDirectCorporate === 'true',
  };

  const report = await debtorReportRepository.getCorporateReport(filters, tenantId);

  res.json({
    success: true,
    message: 'Corporate report retrieved successfully',
    data: report,
  });
});

module.exports = {
  getDebtorSummaryReport,
  getOutstandingReport,
  getAgingReport,
  getCreditLimitsReport,
  getStatementsReport,
  getReconciliationsReport,
  getShaReport,
  getInsuranceReport,
  getCorporateReport,
};
