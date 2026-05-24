const express = require('express');
const {
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
} = require('../controllers/debtor-accounts.controller');
const {
  createDebtorAccountValidator,
  updateDebtorAccountValidator,
  statusActionValidator,
} = require('../validators/debtor-account.routes.validator');

const router = express.Router();

/**
 * GET /api/debtors/accounts
 * List all debtor accounts with filtering and pagination
 */
router.get('/', getDebtorAccounts);

/**
 * POST /api/debtors/accounts
 * Create a new debtor account
 */
router.post('/', createDebtorAccountValidator, createDebtorAccount);

/**
 * GET /api/debtors/accounts/:id
 * Get a single debtor account by ID
 */
router.get('/:id', getDebtorAccountById);

/**
 * PATCH /api/debtors/accounts/:id
 * Update a debtor account
 */
router.patch('/:id', updateDebtorAccountValidator, updateDebtorAccount);

/**
 * POST /api/debtors/accounts/:id/activate
 * Activate a debtor account
 */
router.post('/:id/activate', statusActionValidator, activateDebtorAccount);

/**
 * POST /api/debtors/accounts/:id/hold
 * Put a debtor account on hold
 */
router.post('/:id/hold', statusActionValidator, holdDebtorAccount);

/**
 * POST /api/debtors/accounts/:id/release-hold
 * Release a debtor account from hold
 */
router.post('/:id/release-hold', releaseHoldDebtorAccount);

/**
 * POST /api/debtors/accounts/:id/suspend
 * Suspend a debtor account
 */
router.post('/:id/suspend', statusActionValidator, suspendDebtorAccount);

/**
 * POST /api/debtors/accounts/:id/close
 * Close a debtor account
 */
router.post('/:id/close', statusActionValidator, closeDebtorAccount);

/**
 * POST /api/debtors/accounts/:id/archive
 * Archive a debtor account
 */
router.post('/:id/archive', archiveDebtorAccount);

module.exports = router;
