import { AUDIT_ACTIONS } from "../constants/auditActions.js";
import asyncHandler from "../utils/asyncHandler.js";
import { ok } from "../utils/apiResponse.js";
import * as paymentService from "../services/payment.service.js";

export const createPayment = asyncHandler(async (req, res) => {
  const data = await paymentService.createPayment(req.body, req.auth, req.context || {});
  req.audit = { action: AUDIT_ACTIONS.PAYMENT_RECEIVED, entity: "PAYMENT", entityId: data.id };
  ok(res, data, "Payment created", 201);
});

export const allocatePayment = asyncHandler(async (req, res) => {
  const data = await paymentService.allocatePayment(req.params.id, req.body, req.auth, req.context || {});
  req.audit = { action: AUDIT_ACTIONS.PAYMENT_ALLOCATED, entity: "PAYMENT", entityId: req.params.id };
  ok(res, data, "Payment allocated");
});

