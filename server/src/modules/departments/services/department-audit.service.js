import prisma from "../../prisma.js";

export const departmentAuditService = {
  async logAction(departmentId, actorId, action, entityType, entityId, previousValues = null, newValues = null, reason = null) {
    const auditLog = await prisma.departmentAuditLog.create({
      data: {
        departmentId,
        actorId,
        action,
        entityType,
        entityId,
        previousValues,
        newValues,
        reason
      }
    });
    return auditLog;
  },

  async getDepartmentHistory(departmentId) {
    return prisma.departmentAuditLog.findMany({
      where: { departmentId },
      orderBy: { createdAt: 'desc' },
      include: {
        department: {
          select: {
            id: true,
            name: true,
            code: true
          }
        }
      }
    });
  },

  async getActorHistory(actorId) {
    return prisma.departmentAuditLog.findMany({
      where: { actorId },
      orderBy: { createdAt: 'desc' },
      include: {
        department: {
          select: {
            id: true,
            name: true,
            code: true
          }
        }
      }
    });
  },

  async getActionHistory(action) {
    return prisma.departmentAuditLog.findMany({
      where: { action },
      orderBy: { createdAt: 'desc' },
      include: {
        department: {
          select: {
            id: true,
            name: true,
            code: true
          }
        }
      }
    });
  }
};
