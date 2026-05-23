import { Router } from "express";
import {
  getCashCounters,
  getCashCounter,
  createCashCounter,
  updateCashCounter,
  deleteCashCounter,
  getCashierProfiles,
  getCashierProfile,
  getCashierProfileByUser,
  createCashierProfile,
  updateCashierProfile,
  deleteCashierProfile,
  getCashSessions,
  getCashSession,
  getOpenCashSession,
  openCashSession,
  closeCashSession,
  recordCashPayment,
  requestRefund,
  approveRefund,
  rejectRefund,
  submitHandover,
  reviewHandover,
  getCashDashboardStats
} from "../controllers/cash.controller.js";
import { validateRequest } from "../middlewares/validateRequest.js";

const router = Router();

// ==================== Cash Counter Routes ====================
router.get("/counters", getCashCounters);
router.get("/counters/:id", getCashCounter);
router.post("/counters", createCashCounter);
router.put("/counters/:id", updateCashCounter);
router.delete("/counters/:id", deleteCashCounter);

// ==================== Cashier Profile Routes ====================
router.get("/cashiers", getCashierProfiles);
router.get("/cashiers/me", getCashierProfileByUser);
router.get("/cashiers/:id", getCashierProfile);
router.post("/cashiers", createCashierProfile);
router.put("/cashiers/:id", updateCashierProfile);
router.delete("/cashiers/:id", deleteCashierProfile);

// ==================== Cash Session Routes ====================
router.get("/sessions", getCashSessions);
router.get("/sessions/me", getOpenCashSession);
router.get("/sessions/:id", getCashSession);
router.post("/sessions/open", openCashSession);
router.post("/sessions/:id/close", closeCashSession);

// ==================== Payment Routes ====================
router.post("/payments", recordCashPayment);

// ==================== Refund Routes ====================
router.post("/refunds", requestRefund);
router.post("/refunds/:id/approve", approveRefund);
router.post("/refunds/:id/reject", rejectRefund);

// ==================== Handover Routes ====================
router.post("/handovers", submitHandover);
router.post("/handovers/:id/review", reviewHandover);

// ==================== Dashboard Stats ====================
router.get("/dashboard/stats", getCashDashboardStats);

export default router;
