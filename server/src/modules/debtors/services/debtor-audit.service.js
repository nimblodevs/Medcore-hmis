import prisma from "../../../config/database.js";

/**
 * Create an audit log entry for debtor account actions
 */
export async function createAuditLog(data) {
  const {
    debtorAccountId,
    actorId,
    action,
    entityType,
    entityId,
    previousValues,
    newValues,
    reason,
    ipAddress,
    userAgent
  } = data;

  return await prisma.debtorAuditLog.create({
    data: {
      debtorAccountId,
      actorId,
      action,
      entityType,
      entityId,
      previousValues,
      newValues,
      reason,
      ipAddress,
      userAgent
    }
  });
}

/**
 * Get audit logs for a specific debtor account
 */
export async function getAuditLogsByAccount(debtorAccountId, options = {}) {
  const { limit = 50, offset = 0, action } = options;

  const where = { debtorAccountId };
  
  if (action) {
    where.action = action;
  }

  return await prisma.debtorAuditLog.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: limit,
    skip: offset
  });
}

/**
 * Get audit logs by actor
 */
export async function getAuditLogsByActor(actorId, limit = 50) {
  return await prisma.debtorAuditLog.findMany({
    where: { actorId },
    orderBy: { createdAt: 'desc' },
    take: limit
  });
}

export default {
  createAuditLog,
  getAuditLogsByAccount,
  getAuditLogsByActor
};
