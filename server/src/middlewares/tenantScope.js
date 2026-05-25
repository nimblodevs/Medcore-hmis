import ApiError from "../utils/apiError.js";

const tenantScope = (req, _res, next) => {
  if (!req.auth) return next(new ApiError(401, "Unauthenticated request"));

  const requestedTenantId = req.headers["x-tenant-id"] || req.query.tenantId || req.body.tenantId;

  if (req.auth.isSuperAdmin) {
    req.context = {
      ...(req.context || {}),
      tenantId: requestedTenantId || null
    };
    req.tenant = req.context.tenantId ? { id: req.context.tenantId } : null;
    req.tenantId = req.context.tenantId;
    return next();
  }

  if (!req.auth.tenantId) return next(new ApiError(403, "User is not mapped to a tenant"));

  if (requestedTenantId && requestedTenantId !== req.auth.tenantId) {
    return next(new ApiError(403, "Cross-tenant access denied"));
  }

  req.context = {
    ...(req.context || {}),
    tenantId: req.auth.tenantId
  };
  req.tenant = { id: req.context.tenantId };
  req.tenantId = req.context.tenantId;

  return next();
};

export default tenantScope;
