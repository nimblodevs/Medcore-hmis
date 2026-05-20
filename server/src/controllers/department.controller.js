import asyncHandler from "../utils/asyncHandler.js";
import { ok } from "../utils/apiResponse.js";
import * as departmentService from "../services/department.service.js";

export const listDepartments = asyncHandler(async (req, res) => {
  const data = await departmentService.listDepartments({
    tenantId: req.context?.tenantId || req.auth?.tenantId,
    branchId: req.context?.branchId || null,
    isSuperAdmin: req.auth?.isSuperAdmin
  });
  ok(res, data, "Departments fetched");
});

export const createDepartment = asyncHandler(async (req, res) => {
  const data = await departmentService.createDepartment(req.body, req.auth, req.context || {});
  ok(res, data, "Department created", 201);
});

export const updateDepartment = asyncHandler(async (req, res) => {
  const data = await departmentService.updateDepartment(req.params.id, req.body, req.auth, req.context || {});
  ok(res, data, "Department updated");
});

