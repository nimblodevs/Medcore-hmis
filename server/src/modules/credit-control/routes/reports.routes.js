import { Router } from "express";
import * as reportsController from "../controllers/reports.controller.js";

const router = Router();

// GET /api/credit-control/reports/dashboard - Dashboard statistics
router.get("/reports/dashboard", reportsController.getDashboard);

// GET /api/credit-control/reports/aging - Aging report
router.get("/reports/aging", reportsController.getAgingReport);

// GET /api/credit-control/reports/collector-workload - Collector workload report
router.get("/reports/collector-workload", reportsController.getCollectorWorkload);

// GET /api/credit-control/reports/promises - Promises report
router.get("/reports/promises", reportsController.getPromisesReport);

// GET /api/credit-control/reports/holds - Credit holds report
router.get("/reports/holds", reportsController.getHoldsReport);

// GET /api/credit-control/reports/disputes - Disputes report
router.get("/reports/disputes", reportsController.getDisputesReport);

// GET /api/credit-control/reports/write-offs - Write-offs report
router.get("/reports/write-offs", reportsController.getWriteOffsReport);

// GET /api/credit-control/reports/overdue-accounts - Overdue accounts report
router.get("/reports/overdue-accounts", reportsController.getOverdueAccountsReport);

export default router;
