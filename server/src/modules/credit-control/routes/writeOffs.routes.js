import { Router } from "express";
import * as writeOffsController from "../controllers/writeOffs.controller.js";

const router = Router();

// GET /api/credit-control/write-offs - List all write-off recommendations
router.get("/write-offs", writeOffsController.getWriteOffs);

// POST /api/credit-control/cases/:caseId/write-offs/recommend - Recommend write-off
router.post("/cases/:caseId/write-offs/recommend", writeOffsController.recommendWriteOff);

// POST /api/credit-control/write-offs/:id/approve - Approve write-off
router.post("/write-offs/:id/approve", writeOffsController.approveWriteOff);

// POST /api/credit-control/write-offs/:id/reject - Reject write-off
router.post("/write-offs/:id/reject", writeOffsController.rejectWriteOff);

// POST /api/credit-control/write-offs/:id/post - Post write-off
router.post("/write-offs/:id/post", writeOffsController.postWriteOff);

export default router;
