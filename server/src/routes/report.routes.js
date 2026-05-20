import { Router } from "express";
import * as reportController from "../controllers/report.controller.js";
import requirePermission from "../middlewares/requirePermission.js";
import { PERMISSIONS } from "../config/rbac.js";

const router = Router();

router.get("/credit-invoices", requirePermission(PERMISSIONS.VIEW_REPORTS), reportController.creditInvoices);
router.get("/outstanding-balances", requirePermission(PERMISSIONS.VIEW_REPORTS), reportController.outstandingBalances);
router.get("/tenant-summary", requirePermission(PERMISSIONS.VIEW_REPORTS), reportController.tenantSummary);
router.get("/branch-summary", requirePermission(PERMISSIONS.VIEW_REPORTS), reportController.branchSummary);

export default router;

