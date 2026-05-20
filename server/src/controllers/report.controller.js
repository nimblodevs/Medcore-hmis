import asyncHandler from "../utils/asyncHandler.js";
import { ok } from "../utils/apiResponse.js";
import * as reportService from "../services/report.service.js";

export const creditInvoices = asyncHandler(async (req, res) => {
  const data = await reportService.creditInvoicesReport(req.context || {});
  ok(res, data, "Credit invoices report");
});

export const outstandingBalances = asyncHandler(async (req, res) => {
  const data = await reportService.outstandingBalancesReport(req.context || {});
  ok(res, data, "Outstanding balances report");
});

export const tenantSummary = asyncHandler(async (req, res) => {
  const data = await reportService.tenantSummaryReport(req.context || {});
  ok(res, data, "Tenant summary report");
});

export const branchSummary = asyncHandler(async (req, res) => {
  const data = await reportService.branchSummaryReport(req.context || {});
  ok(res, data, "Branch summary report");
});

