import { Router } from "express";
import * as followUpController from "../controllers/followUps.controller.js";

const router = Router();

// GET /api/credit-control/cases/:caseId/follow-ups - List follow-ups for a case
router.get("/cases/:caseId/follow-ups", followUpController.getFollowUpsByCase);

// POST /api/credit-control/cases/:caseId/follow-ups - Record new follow-up
router.post("/cases/:caseId/follow-ups", followUpController.recordFollowUp);

// GET /api/credit-control/follow-ups/due-today - Get follow-ups due today
router.get("/follow-ups/due-today", followUpController.getFollowUpsDueToday);

// GET /api/credit-control/follow-ups/overdue - Get overdue follow-ups
router.get("/follow-ups/overdue", followUpController.getOverdueFollowUps);

export default router;
