import { AUDIT_ACTIONS } from "../constants/auditActions.js";
import asyncHandler from "../utils/asyncHandler.js";
import { ok } from "../utils/apiResponse.js";
import * as userService from "../services/user.service.js";

export const listUsers = asyncHandler(async (req, res) => {
  const data = await userService.listUsers({
    tenantId: req.context?.tenantId || req.auth?.tenantId,
    isSuperAdmin: req.auth?.isSuperAdmin
  });
  ok(res, data, "Users fetched");
});

export const createUser = asyncHandler(async (req, res) => {
  const data = await userService.createUser(req.body, req.auth, req.context || {});
  ok(res, data, "User created", 201);
});

export const updateUser = asyncHandler(async (req, res) => {
  const data = await userService.updateUser(req.params.id, req.body, req.auth, req.context || {});
  ok(res, data, "User updated");
});

export const assignUserRoles = asyncHandler(async (req, res) => {
  const data = await userService.assignRoles(req.params.id, req.body.roleIds, req.auth, req.context || {});
  req.audit = { action: AUDIT_ACTIONS.USER_ROLE_CHANGED, entity: "USER", entityId: req.params.id, details: data };
  ok(res, data, "User roles assigned");
});

export const assignUserBranches = asyncHandler(async (req, res) => {
  const data = await userService.assignBranches(req.params.id, req.body.branchIds, req.auth, req.context || {});
  req.audit = { action: AUDIT_ACTIONS.BRANCH_ASSIGNMENT_CHANGED, entity: "USER", entityId: req.params.id, details: data };
  ok(res, data, "User branches assigned");
});

export const assignUserDepartments = asyncHandler(async (req, res) => {
  const data = await userService.assignDepartments(req.params.id, req.body, req.auth, req.context || {});
  req.audit = { action: AUDIT_ACTIONS.DEPARTMENT_ASSIGNMENT_CHANGED, entity: "USER", entityId: req.params.id, details: data };
  ok(res, data, "User departments assigned");
});
