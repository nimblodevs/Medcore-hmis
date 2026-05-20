import prisma from "../config/prisma.js";

export const logAudit = async ({
  action,
  entity,
  entityId = null,
  details = null,
  userId = null,
  tenantId = null,
  branchId = null,
  ipAddress = null,
  userAgent = null
}) =>
  prisma.auditLog.create({
    data: {
      action,
      entity,
      entityId,
      details: details || undefined,
      userId,
      tenantId,
      branchId,
      ipAddress,
      userAgent
    }
  });
