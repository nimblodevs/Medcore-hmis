const express = require('express');
const {
  getDebtorSummaryReport,
  getOutstandingReport,
  getAgingReport,
  getCreditLimitsReport,
  getStatementsReport,
  getReconciliationsReport,
  getShaReport,
  getInsuranceReport,
  getCorporateReport,
} = require('../controllers/debtor-reports.controller');

const router = express.Router();

/**
 * GET /api/debtors/reports/summary
 * Get debtor summary report
 */
router.get('/summary', getDebtorSummaryReport);

/**
 * GET /api/debtors/reports/outstanding
 * Get outstanding report by debtor type
 */
router.get('/outstanding', getOutstandingReport);

/**
 * GET /api/debtors/reports/aging
 * Get aging report
 */
router.get('/aging', getAgingReport);

/**
 * GET /api/debtors/reports/credit-limits
 * Get credit limits report
 */
router.get('/credit-limits', getCreditLimitsReport);

/**
 * GET /api/debtors/reports/statements
 * Get statements report
 */
router.get('/statements', getStatementsReport);

/**
 * GET /api/debtors/reports/reconciliations
 * Get reconciliations report
 */
router.get('/reconciliations', getReconciliationsReport);

/**
 * GET /api/debtors/reports/sha
 * Get SHA specific report
 */
router.get('/sha', getShaReport);

/**
 * GET /api/debtors/reports/insurance
 * Get insurance specific report
 */
router.get('/insurance', getInsuranceReport);

/**
 * GET /api/debtors/reports/corporates
 * Get corporate specific report
 */
router.get('/corporates', getCorporateReport);

module.exports = router;
