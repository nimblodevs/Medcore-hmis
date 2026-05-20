import { Router } from "express";
import * as invoiceController from "../controllers/invoice.controller.js";
import requirePermission from "../middlewares/requirePermission.js";
import validateRequest from "../middlewares/validateRequest.js";
import { updateInvoiceItemSchema } from "../validators/invoice.validator.js";
import { PERMISSIONS } from "../config/rbac.js";

const router = Router();

router.patch("/:id", requirePermission(PERMISSIONS.EDIT_DRAFT_INVOICES), validateRequest(updateInvoiceItemSchema), invoiceController.updateInvoiceItem);
router.delete("/:id", requirePermission(PERMISSIONS.EDIT_DRAFT_INVOICES), invoiceController.deleteInvoiceItem);

export default router;

