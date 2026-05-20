import { Router } from "express";
import * as receiptController from "../controllers/receipt.controller.js";
import requirePermission from "../middlewares/requirePermission.js";
import validateRequest from "../middlewares/validateRequest.js";
import { createReceiptSchema } from "../validators/payment.validator.js";
import { PERMISSIONS } from "../config/rbac.js";

const router = Router();

router.post("/", requirePermission(PERMISSIONS.RECEIVE_PAYMENTS), validateRequest(createReceiptSchema), receiptController.createReceipt);
router.get("/:id", requirePermission(PERMISSIONS.VIEW_INVOICES), receiptController.getReceipt);

export default router;

