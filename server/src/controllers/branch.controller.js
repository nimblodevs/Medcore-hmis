import asyncHandler from "../utils/asyncHandler.js";
import { ok } from "../utils/apiResponse.js";
import * as branchService from "../services/branch.service.js";

export const listBranches = asyncHandler(async (req, res) => {
  const data = await branchService.listBranches({
    tenantId: req.context?.tenantId || req.auth?.tenantId,
    branchId: req.context?.branchId || null,
    isSuperAdmin: req.auth?.isSuperAdmin
  });
  ok(res, data, "Branches fetched");
});

export const createBranch = asyncHandler(async (req, res) => {
  const data = await branchService.createBranch(req.body, req.auth.userId, req.context || {});
  ok(res, data, "Branch created", 201);
});

export const updateBranch = asyncHandler(async (req, res) => {
  const data = await branchService.updateBranch(req.params.id, req.body, req.auth.userId, req.context || {});
  ok(res, data, "Branch updated");
});

