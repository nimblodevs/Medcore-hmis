import asyncHandler from "../utils/asyncHandler.js";
import { ok } from "../utils/apiResponse.js";
import * as roleService from "../services/role.service.js";

export const listRoles = asyncHandler(async (req, res) => {
  const data = await roleService.listRoles({
    tenantId: req.context?.tenantId || req.auth?.tenantId,
    isSuperAdmin: req.auth?.isSuperAdmin
  });
  ok(res, data, "Roles fetched");
});

export const createRole = asyncHandler(async (req, res) => {
  const data = await roleService.createRole(req.body, req.auth, req.context || {});
  ok(res, data, "Role created", 201);
});

