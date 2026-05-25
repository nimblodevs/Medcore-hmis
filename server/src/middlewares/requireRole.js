import ApiError from "../utils/apiError.js";

const requireRole = (...requiredRoles) => (req, _res, next) => {
  if (!req.auth) return next(new ApiError(401, "Unauthenticated request"));
  if (req.auth.isSuperAdmin) return next();

  const rolesToCheck = requiredRoles.flat();
  const userRoles = new Set(req.auth.roles || []);
  const hasRole = rolesToCheck.some((role) => userRoles.has(role));

  if (!hasRole) {
    return next(new ApiError(403, "You do not have the required role for this action"));
  }

  return next();
};

export default requireRole;
