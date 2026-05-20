import asyncHandler from "../utils/asyncHandler.js";
import { ok } from "../utils/apiResponse.js";
import * as tenantService from "../services/tenant.service.js";

export const listTenants = asyncHandler(async (req, res) => {
  const data = await tenantService.listTenants({
    tenantId: req.context?.tenantId || req.auth?.tenantId,
    isSuperAdmin: req.auth?.isSuperAdmin
  });
  ok(res, data, "Tenants fetched");
});

export const createTenant = asyncHandler(async (req, res) => {
  const data = await tenantService.createTenant(req.body, req.auth.userId);
  ok(res, data, "Tenant created", 201);
});

export const updateTenant = asyncHandler(async (req, res) => {
  const data = await tenantService.updateTenant(req.params.id, req.body, req.auth.userId, req.context || {});
  ok(res, data, "Tenant updated");
});
