import { logAudit } from "../services/audit.service.js";

const auditLogger = (req, res, next) => {
  res.on("finish", () => {
    if (!req.audit || res.statusCode >= 400) return;
    logAudit({
      action: req.audit.action,
      entity: req.audit.entity,
      entityId: req.audit.entityId || null,
      details: req.audit.details || null,
      userId: req.auth?.userId || null,
      tenantId: req.context?.tenantId || req.auth?.tenantId || null,
      branchId: req.context?.branchId || req.auth?.branchId || null,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"] || null
    }).catch(() => undefined);
  });
  next();
};

export default auditLogger;
