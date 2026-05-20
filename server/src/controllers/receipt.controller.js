import { AUDIT_ACTIONS } from "../constants/auditActions.js";
import asyncHandler from "../utils/asyncHandler.js";
import { ok } from "../utils/apiResponse.js";
import * as receiptService from "../services/receipt.service.js";

export const createReceipt = asyncHandler(async (req, res) => {
  const data = await receiptService.createReceipt(req.body, req.auth, req.context || {});
  req.audit = { action: AUDIT_ACTIONS.RECEIPT_GENERATED, entity: "RECEIPT", entityId: data.id };
  ok(res, data, "Receipt generated", 201);
});

export const getReceipt = asyncHandler(async (req, res) => {
  const data = await receiptService.getReceiptById(req.params.id, req.context || {});
  ok(res, data, "Receipt fetched");
});

export const getInvoiceReceipts = asyncHandler(async (req, res) => {
  const data = await receiptService.getInvoiceReceipts(req.params.id, req.context || {});
  ok(res, data, "Invoice receipts fetched");
});

