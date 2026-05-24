const express = require('express');
const {
  getDebtorBalance,
  recalculateDebtorBalance,
  getDebtorAging,
  getAgingSummary,
} = require('../controllers/debtor-balances.controller');

const router = express.Router();

/**
 * GET /api/debtors/accounts/:accountId/balance
 * Get current balance for a debtor account
 */
router.get('/:accountId/balance', getDebtorBalance);

/**
 * POST /api/debtors/accounts/:accountId/recalculate-balance
 * Recalculate balance for a debtor account
 */
router.post('/:accountId/recalculate-balance', recalculateDebtorBalance);

/**
 * GET /api/debtors/accounts/:accountId/aging
 * Get aging report for a debtor account
 */
router.get('/:accountId/aging', getDebtorAging);

/**
 * GET /api/debtors/aging/summary
 * Get aging summary for all debtors
 */
router.get('/aging/summary', getAgingSummary);

module.exports = router;
