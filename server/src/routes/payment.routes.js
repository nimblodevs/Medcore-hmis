import { Router } from "express";
import * as paymentController from "../controllers/payment.controller.js";
import requirePermission from "../middlewares/requirePermission.js";
import validateRequest from "../middlewares/validateRequest.js";
import { allocatePaymentSchema, createPaymentSchema } from "../validators/payment.validator.js";
import { PERMISSIONS } from "../config/rbac.js";

const router = Router();

router.post("/", requirePermission(PERMISSIONS.RECEIVE_PAYMENTS), validateRequest(createPaymentSchema), paymentController.createPayment);
router.post("/:id/allocate", requirePermission(PERMISSIONS.RECEIVE_PAYMENTS), validateRequest(allocatePaymentSchema), paymentController.allocatePayment);

export default router;

