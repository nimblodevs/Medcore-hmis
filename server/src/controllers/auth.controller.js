import { AUDIT_ACTIONS } from "../constants/auditActions.js";
import { ok } from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import * as authService from "../services/auth.service.js";

export const register = asyncHandler(async (req, res) => {
  const data = await authService.register(req.body, req.auth?.userId || null);
  ok(res, data, "User registered", 201);
});

export const login = asyncHandler(async (req, res) => {
  const data = await authService.login(req.body);
  req.audit = { action: AUDIT_ACTIONS.USER_LOGIN, entity: "AUTH", details: { email: req.body.email } };
  ok(res, data, "Login successful");
});

export const refreshToken = asyncHandler(async (req, res) => {
  const data = await authService.refreshAccess(req.body.refreshToken);
  ok(res, data, "Token refreshed");
});

export const logout = asyncHandler(async (req, res) => {
  await authService.logout(req.auth.userId);
  ok(res, null, "Logged out");
});

export const me = asyncHandler(async (req, res) => {
  const data = await authService.me(req.auth.userId);
  ok(res, data, "Current user profile");
});

