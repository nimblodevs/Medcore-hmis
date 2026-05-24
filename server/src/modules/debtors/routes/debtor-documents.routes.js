const express = require('express');
const {
  getDebtorDocuments,
  uploadDebtorDocument,
  deleteDebtorDocument,
} = require('../controllers/debtor-documents.controller');

const router = express.Router();

/**
 * GET /api/debtors/accounts/:accountId/documents
 * Get all documents for a debtor account
 */
router.get('/', getDebtorDocuments);

/**
 * POST /api/debtors/accounts/:accountId/documents
 * Upload a new document for a debtor account
 */
router.post('/', uploadDebtorDocument);

module.exports = router;
