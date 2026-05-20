import { AUDIT_ACTIONS } from "../constants/auditActions.js";
import asyncHandler from "../utils/asyncHandler.js";
import { ok } from "../utils/apiResponse.js";
import * as invoiceService from "../services/invoice.service.js";

export const listInvoices = asyncHandler(async (req, res) => {
  const data = await invoiceService.listInvoices(req.context || {});
  ok(res, data, "Invoices fetched");
});

export const getInvoice = asyncHandler(async (req, res) => {
  const data = await invoiceService.getInvoiceById(req.params.id, req.context || {});
  ok(res, data, "Invoice fetched");
});

export const createInvoice = asyncHandler(async (req, res) => {
  const data = await invoiceService.createInvoice(req.body, req.auth, req.context || {});
  req.audit = { action: AUDIT_ACTIONS.INVOICE_CREATED, entity: "INVOICE", entityId: data.id };
  ok(res, data, "Invoice created", 201);
});

export const updateInvoice = asyncHandler(async (req, res) => {
  const data = await invoiceService.updateInvoice(req.params.id, req.body, req.auth, req.context || {});
  ok(res, data, "Invoice updated");
});

export const submitApproval = asyncHandler(async (req, res) => {
  const data = await invoiceService.submitForApproval(req.params.id, req.body.comments, req.auth, req.context || {});
  req.audit = { action: AUDIT_ACTIONS.INVOICE_SUBMITTED_FOR_APPROVAL, entity: "INVOICE", entityId: req.params.id };
  ok(res, data, "Invoice submitted for approval");
});

export const approveInvoice = asyncHandler(async (req, res) => {
  const data = await invoiceService.approveInvoice(req.params.id, req.body.comments, req.auth, req.context || {});
  req.audit = { action: AUDIT_ACTIONS.INVOICE_APPROVED, entity: "INVOICE", entityId: req.params.id };
  ok(res, data, "Invoice approved");
});

export const rejectInvoice = asyncHandler(async (req, res) => {
  const data = await invoiceService.rejectInvoice(req.params.id, req.body.comments, req.auth, req.context || {});
  req.audit = { action: AUDIT_ACTIONS.INVOICE_REJECTED, entity: "INVOICE", entityId: req.params.id };
  ok(res, data, "Invoice rejected");
});

export const submitToPayer = asyncHandler(async (req, res) => {
  const data = await invoiceService.submitInvoiceToPayer(req.params.id, req.body.comments, req.auth, req.context || {});
  req.audit = { action: AUDIT_ACTIONS.INVOICE_SUBMITTED_TO_PAYER, entity: "INVOICE", entityId: req.params.id };
  ok(res, data, "Invoice submitted to payer");
});

export const generateClaim = asyncHandler(async (req, res) => {
  const data = await invoiceService.generateClaimForInvoice(req.params.id, req.auth, req.context || {});
  req.audit = { action: AUDIT_ACTIONS.CLAIM_GENERATED, entity: "INVOICE", entityId: req.params.id };
  ok(res, data, "Claim generated");
});

export const cancelInvoice = asyncHandler(async (req, res) => {
  const data = await invoiceService.cancelInvoice(req.params.id, req.body.comments, req.auth, req.context || {});
  req.audit = { action: AUDIT_ACTIONS.INVOICE_CANCELLED, entity: "INVOICE", entityId: req.params.id };
  ok(res, data, "Invoice cancelled");
});

export const reverseInvoice = asyncHandler(async (req, res) => {
  const data = await invoiceService.reverseInvoice(req.params.id, req.body.comments, req.auth, req.context || {});
  req.audit = { action: AUDIT_ACTIONS.INVOICE_REVERSED, entity: "INVOICE", entityId: req.params.id };
  ok(res, data, "Invoice reversed");
});

export const addInvoiceItem = asyncHandler(async (req, res) => {
  const data = await invoiceService.addInvoiceItem(req.params.id, req.body, req.auth, req.context || {});
  ok(res, data, "Invoice item created", 201);
});

export const updateInvoiceItem = asyncHandler(async (req, res) => {
  const data = await invoiceService.updateInvoiceItem(req.params.id, req.body, req.auth, req.context || {});
  ok(res, data, "Invoice item updated");
});

export const deleteInvoiceItem = asyncHandler(async (req, res) => {
  const data = await invoiceService.deleteInvoiceItem(req.params.id, req.auth, req.context || {});
  ok(res, data, "Invoice item deleted");
});

export const listInvoiceReceipts = asyncHandler(async (req, res) => {
  const data = await invoiceService.listInvoiceReceipts(req.params.id, req.context || {});
  ok(res, data, "Invoice receipts fetched");
});

