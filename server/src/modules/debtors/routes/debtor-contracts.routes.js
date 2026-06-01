const express = require('express');
const {
  getDebtorContracts,
  createDebtorContract,
} = require('../controllers/debtor-contracts.controller');

const router = express.Router();

/**
 * GET /api/debtors/accounts/:accountId/contracts
 * Get all contracts for a debtor account
 */
router.get('/', getDebtorContracts);

/**
 * POST /api/debtors/accounts/:accountId/contracts
 * Create a new contract for a debtor account
 */
router.post('/', createDebtorContract);

module.exports = router;
