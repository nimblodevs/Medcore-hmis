const express = require('express');
const {
  getDebtorContacts,
  createDebtorContact,
} = require('../controllers/debtor-contacts.controller');

const router = express.Router();

/**
 * GET /api/debtors/accounts/:accountId/contacts
 * Get all contacts for a debtor account
 */
router.get('/', getDebtorContacts);

/**
 * POST /api/debtors/accounts/:accountId/contacts
 * Create a new contact for a debtor account
 */
router.post('/', createDebtorContact);

module.exports = router;
