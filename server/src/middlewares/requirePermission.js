import ApiError from "../utils/apiError.js";

const requirePermission = (...requiredPermissions) => (req, _res, next) => {
  if (!req.auth) {
    return next(new ApiError(401, "Unauthenticated request"));
  }

  if (req.auth.isSuperAdmin) {
    return next();
  }

  const granted = new Set(req.auth.permissions || []);
  const hasPermission = requiredPermissions.every((permission) => granted.has(permission));

  if (!hasPermission) {
    return next(new ApiError(403, "You do not have permission to perform this action"));
  }

  return next();
};

export default requirePermission;
