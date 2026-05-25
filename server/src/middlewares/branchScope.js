import ApiError from "../utils/apiError.js";
import { ROLES } from "../config/rbac.js";

const branchScope = (req, _res, next) => {
  if (!req.auth) return next(new ApiError(401, "Unauthenticated request"));

  const requestedBranchId = req.headers["x-branch-id"] || req.query.branchId || req.body.branchId;
  const assignedBranchIds = (req.user?.branches || []).map((item) => item.branchId);
  const userRoles = new Set(req.auth?.roles || []);
  const canAccessAllTenantBranches = userRoles.has(ROLES.HOSPITAL_ADMIN);

  if (req.auth.isSuperAdmin) {
    req.context = { ...(req.context || {}), branchId: requestedBranchId || null };
    req.branch = req.context.branchId ? { id: req.context.branchId } : null;
    req.branchId = req.context.branchId;
    return next();
  }

  if (canAccessAllTenantBranches) {
    req.context = { ...(req.context || {}), branchId: requestedBranchId || null };
    req.branch = req.context.branchId ? { id: req.context.branchId } : null;
    req.branchId = req.context.branchId;
    return next();
  }

  if (!requestedBranchId) {
    req.context = { ...(req.context || {}), branchId: assignedBranchIds[0] || null };
    req.branch = req.context.branchId ? { id: req.context.branchId } : null;
    req.branchId = req.context.branchId;
    return next();
  }

  if (!assignedBranchIds.includes(requestedBranchId)) {
    return next(new ApiError(403, "Branch access denied"));
  }

  req.context = { ...(req.context || {}), branchId: requestedBranchId };
  req.branch = req.context.branchId ? { id: req.context.branchId } : null;
  req.branchId = req.context.branchId;
  return next();
};

export default branchScope;
