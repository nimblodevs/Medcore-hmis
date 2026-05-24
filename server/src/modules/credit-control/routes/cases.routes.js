import { Router } from "express";
import * as casesController from "../controllers/cases.controller.js";

const router = Router();

// GET /api/credit-control/cases - List all cases
router.get("/", casesController.getCases);

// GET /api/credit-control/cases/:id - Get case by ID
router.get("/:id", casesController.getCaseById);

// POST /api/credit-control/cases - Create new case
router.post("/", casesController.createCase);

// PATCH /api/credit-control/cases/:id - Update case
router.patch("/:id", casesController.updateCase);

// POST /api/credit-control/cases/:id/assign - Assign collector
router.post("/:id/assign", casesController.assignCollector);

// POST /api/credit-control/cases/:id/close - Close case
router.post("/:id/close", casesController.closeCase);

// POST /api/credit-control/cases/:id/reopen - Reopen case
router.post("/:id/reopen", casesController.reopenCase);

export default router;
