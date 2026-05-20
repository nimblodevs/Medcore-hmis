import { Router } from "express";
import * as invoiceController from "../controllers/invoice.controller.js";
import requirePermission from "../middlewares/requirePermission.js";
import validateRequest from "../middlewares/validateRequest.js";
import {
  approvalDecisionSchema,
  createInvoiceItemSchema,
  createInvoiceSchema,
  updateInvoiceSchema
} from "../validators/invoice.validator.js";
import { PERMISSIONS } from "../config/rbac.js";

const router = Router();

router.get("/", requirePermission(PERMISSIONS.VIEW_INVOICES), invoiceController.listInvoices);
router.get("/:id", requirePermission(PERMISSIONS.VIEW_INVOICES), invoiceController.getInvoice);
router.post("/", requirePermission(PERMISSIONS.CREATE_INVOICES), validateRequest(createInvoiceSchema), invoiceController.createInvoice);
router.patch("/:id", requirePermission(PERMISSIONS.EDIT_DRAFT_INVOICES), validateRequest(updateInvoiceSchema), invoiceController.updateInvoice);
router.post("/:id/submit-approval", requirePermission(PERMISSIONS.EDIT_DRAFT_INVOICES), validateRequest(approvalDecisionSchema), invoiceController.submitApproval);
router.post("/:id/approve", requirePermission(PERMISSIONS.APPROVE_INVOICES), validateRequest(approvalDecisionSchema), invoiceController.approveInvoice);
router.post("/:id/reject", requirePermission(PERMISSIONS.APPROVE_INVOICES), validateRequest(approvalDecisionSchema), invoiceController.rejectInvoice);
router.post("/:id/submit-to-payer", requirePermission(PERMISSIONS.SUBMIT_TO_PAYER), validateRequest(approvalDecisionSchema), invoiceController.submitToPayer);
router.post("/:id/generate-claim", requirePermission(PERMISSIONS.GENERATE_CLAIMS), invoiceController.generateClaim);
router.post("/:id/cancel", requirePermission(PERMISSIONS.EDIT_DRAFT_INVOICES), validateRequest(approvalDecisionSchema), invoiceController.cancelInvoice);
router.post("/:id/reverse", requirePermission(PERMISSIONS.REVERSE_INVOICES), validateRequest(approvalDecisionSchema), invoiceController.reverseInvoice);

router.post("/:id/items", requirePermission(PERMISSIONS.EDIT_DRAFT_INVOICES), validateRequest(createInvoiceItemSchema), invoiceController.addInvoiceItem);
router.get("/:id/receipts", requirePermission(PERMISSIONS.VIEW_INVOICES), invoiceController.listInvoiceReceipts);

export default router;
