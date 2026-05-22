import { Router } from "express";
import { requirePermission } from "../middlewares/requirePermission.js";
import { PERMISSIONS } from "../config/rbac.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { getReversalById, getInvoiceReversals, listReversals, reversePayment, getReversalStats, voidReceipt, reprintReceipt } from "../services/reversal.service.js";

const router = Router();

/**
 * GET /api/reversals - List all reversals with filters
 */
router.get(
  "/",
  requirePermission(PERMISSIONS.VIEW_REPORTS),
  asyncHandler(async (req, res) => {
    const context = {
      tenantId: req.tenantId,
      branchId: req.branchId
    };
    
    const reversals = await listReversals(req.query, context);
    res.json({ success: true, data: reversals });
  })
);

/**
 * GET /api/reversals/stats - Get reversal statistics
 */
router.get(
  "/stats",
  requirePermission(PERMISSIONS.VIEW_REPORTS),
  asyncHandler(async (req, res) => {
    const context = {
      tenantId: req.tenantId,
      branchId: req.branchId
    };
    
    const stats = await getReversalStats(req.query, context);
    res.json({ success: true, data: stats });
  })
);

/**
 * GET /api/reversals/:id - Get reversal by ID
 */
router.get(
  "/:id",
  requirePermission(PERMISSIONS.VIEW_REPORTS),
  asyncHandler(async (req, res) => {
    const context = {
      tenantId: req.tenantId,
      branchId: req.branchId
    };
    
    const reversal = await getReversalById(req.params.id, context);
    res.json({ success: true, data: reversal });
  })
);

/**
 * GET /api/invoices/:invoiceId/reversals - Get reversals for an invoice
 */
router.get(
  "/invoices/:invoiceId/reversals",
  requirePermission(PERMISSIONS.VIEW_INVOICES),
  asyncHandler(async (req, res) => {
    const context = {
      tenantId: req.tenantId,
      branchId: req.branchId
    };
    
    const reversals = await getInvoiceReversals(req.params.invoiceId, context);
    res.json({ success: true, data: reversals });
  })
);

/**
 * POST /api/payments/:paymentId/reverse - Reverse a payment
 */
router.post(
  "/payments/:paymentId/reverse",
  requirePermission(PERMISSIONS.REVERSE_INVOICES),
  asyncHandler(async (req, res) => {
    const context = {
      tenantId: req.tenantId,
      branchId: req.branchId
    };
    
    const actor = {
      userId: req.user.id
    };
    
    const { reason } = req.body;
    
    const result = await reversePayment(req.params.paymentId, reason, actor, context);
    res.json({ success: true, data: result, message: "Payment reversed successfully" });
  })
);

/**
 * POST /api/receipts/:receiptId/void - Void a receipt
 */
router.post(
  "/receipts/:receiptId/void",
  requirePermission(PERMISSIONS.REVERSE_INVOICES),
  asyncHandler(async (req, res) => {
    const context = {
      tenantId: req.tenantId,
      branchId: req.branchId
    };
    
    const actor = {
      userId: req.user.id
    };
    
    const { reason } = req.body;
    
    const result = await voidReceipt(req.params.receiptId, reason, actor, context);
    res.json({ success: true, data: result, message: "Receipt voided successfully" });
  })
);

/**
 * POST /api/receipts/:receiptId/reprint - Reprint a receipt
 */
router.post(
  "/receipts/:receiptId/reprint",
  requirePermission(PERMISSIONS.VIEW_INVOICES),
  asyncHandler(async (req, res) => {
    const context = {
      tenantId: req.tenantId,
      branchId: req.branchId
    };
    
    const actor = {
      userId: req.user.id
    };
    
    const result = await reprintReceipt(req.params.receiptId, actor, context);
    res.json({ success: true, data: result, message: "Receipt reprinted successfully" });
  })
);

export default router;
