import { prisma } from "../../../utils/prisma.js";

export class SchemeAuditService {
  async logAction({ debtorSchemeId, tenantId, actorId, action, entityType, entityId, previousValues, newValues, reason, ipAddress, userAgent }) {
    return prisma.schemeAuditLog.create({
      data: {
        tenantId,
        debtorSchemeId,
        actorId,
        action,
        entityType,
        entityId,
        previousValues: previousValues ? JSON.stringify(previousValues) : null,
        newValues: newValues ? JSON.stringify(newValues) : null,
        reason,
        ipAddress,
        userAgent
      }
    });
  }

  async getAuditHistory(debtorSchemeId, options = {}) {
    const { limit = 50, offset = 0, action } = options;
    
    const where = {
      debtorSchemeId,
      ...(action ? { action } : {})
    };

    return prisma.schemeAuditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
      include: {
        debtorScheme: {
          select: {
            id: true,
            schemeCode: true,
            schemeName: true
          }
        }
      }
    });
  }
}

export const schemeAuditService = new SchemeAuditService();
