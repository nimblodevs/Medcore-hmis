import { Router } from "express";
import * as holdsController from "../controllers/holds.controller.js";

const router = Router();

// GET /api/credit-control/holds - List all credit holds
router.get("/holds", holdsController.getHolds);

// POST /api/credit-control/cases/:caseId/holds/recommend - Recommend credit hold
router.post("/cases/:caseId/holds/recommend", holdsController.recommendHold);

// POST /api/credit-control/holds/:id/approve - Approve credit hold
router.post("/holds/:id/approve", holdsController.approveHold);

// POST /api/credit-control/holds/:id/reject - Reject credit hold
router.post("/holds/:id/reject", holdsController.rejectHold);

// POST /api/credit-control/holds/:id/release - Release credit hold
router.post("/holds/:id/release", holdsController.releaseHold);

export default router;
