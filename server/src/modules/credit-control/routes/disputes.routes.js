import { Router } from "express";
import * as disputesController from "../controllers/disputes.controller.js";

const router = Router();

// GET /api/credit-control/disputes - List all credit disputes
router.get("/disputes", disputesController.getDisputes);

// POST /api/credit-control/cases/:caseId/disputes - Create new dispute
router.post("/cases/:caseId/disputes", disputesController.createDispute);

// POST /api/credit-control/disputes/:id/resolve - Resolve dispute
router.post("/disputes/:id/resolve", disputesController.resolveDispute);

// POST /api/credit-control/disputes/:id/cancel - Cancel dispute
router.post("/disputes/:id/cancel", disputesController.cancelDispute);

export default router;
