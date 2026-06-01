const express = require('express');
const {
  getDebtorStatements,
  generateDebtorStatement,
} = require('../controllers/debtor-statements.controller');

const router = express.Router();

/**
 * GET /api/debtors/accounts/:accountId/statements
 * Get all statements for a debtor account
 */
router.get('/', getDebtorStatements);

/**
 * POST /api/debtors/accounts/:accountId/statements/generate
 * Generate a new statement for a debtor account
 */
router.post('/generate', generateDebtorStatement);

module.exports = router;
