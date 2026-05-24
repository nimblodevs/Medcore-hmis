const express = require('express');
const debtorAccountsRoutes = require('./debtor-accounts.routes');
const debtorContactsRoutes = require('./debtor-contacts.routes');
const debtorContractsRoutes = require('./debtor-contracts.routes');
const debtorStatementsRoutes = require('./debtor-statements.routes');
const debtorReconciliationsRoutes = require('./debtor-reconciliations.routes');
const debtorDocumentsRoutes = require('./debtor-documents.routes');
const debtorBalancesRoutes = require('./debtor-balances.routes');
const debtorReportsRoutes = require('./debtor-reports.routes');

const router = express.Router();

// Mount routes
router.use('/accounts', debtorAccountsRoutes);
router.use('/accounts/:accountId/contacts', debtorContactsRoutes);
router.use('/accounts/:accountId/contracts', debtorContractsRoutes);
router.use('/accounts/:accountId/statements', debtorStatementsRoutes);
router.use('/accounts/:accountId/reconciliations', debtorReconciliationsRoutes);
router.use('/accounts/:accountId/documents', debtorDocumentsRoutes);
router.use('/', debtorBalancesRoutes);
router.use('/reports', debtorReportsRoutes);

module.exports = router;
