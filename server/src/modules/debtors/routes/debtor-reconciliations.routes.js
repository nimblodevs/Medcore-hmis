const express = require('express');
const {
  getDebtorReconciliations,
  createDebtorReconciliation,
} = require('../controllers/debtor-reconciliations.controller');

const router = express.Router();

/**
 * GET /api/debtors/accounts/:accountId/reconciliations
 * Get all reconciliations for a debtor account
 */
router.get('/', getDebtorReconciliations);

/**
 * POST /api/debtors/accounts/:accountId/reconciliations
 * Create a new reconciliation for a debtor account
 */
router.post('/', createDebtorReconciliation);

module.exports = router;
