import prisma from "../../../config/prisma.js";

export class DebtorSchemeRepository {
  async create(data, user) {
    const { tenantId, branchId, actorId } = user;
    
    return prisma.$transaction(async (tx) => {
      const scheme = await tx.debtorScheme.create({
        data: {
          ...data,
          tenantId,
          branchId: branchId || null,
          createdById: actorId,
          updatedById: actorId
        },
        include: {
          debtorAccount: {
            select: {
              id: true,
              debtorCode: true,
              debtorName: true,
              debtorType: true
            }
          }
        }
      });

      await tx.schemeAuditLog.create({
        data: {
          tenantId,
          debtorSchemeId: scheme.id,
          actorId,
          action: "SCHEME_CREATED",
          entityType: "DebtorScheme",
          entityId: scheme.id,
          newValues: data
        }
      });

      return scheme;
    });
  }

  async findById(id, tenantId) {
    return prisma.debtorScheme.findUnique({
      where: { id, tenantId },
      include: {
        debtorAccount: {
          select: {
            id: true,
            debtorCode: true,
            debtorName: true,
            debtorType: true,
            status: true
          }
        },
        departmentRules: {
          where: { isActive: true },
          include: {
            department: {
              select: {
                id: true,
                name: true,
                code: true
              }
            }
          }
        },
        servicePointRules: {
          where: { isActive: true }
        },
        outpatientLimits: {
          where: { isActive: true }
        },
        visitLimits: {
          where: { isActive: true }
        },
        copaymentCategories: {
          where: { isActive: true }
        },
        copaymentRules: {
          where: { isActive: true }
        },
        authorizationRules: {
          where: { isActive: true }
        }
      }
    });
  }

  async findByDebtorAccount(debtorAccountId, tenantId, options = {}) {
    const { status, schemeType, includeInactive = false } = options;
    
    const where = {
      debtorAccountId,
      tenantId,
      ...(status ? { status } : {}),
      ...(schemeType ? { schemeType } : {}),
      ...(!includeInactive ? { status: { notIn: ["INACTIVE", "SUSPENDED", "ARCHIVED"] } } : {})
    };

    return prisma.debtorScheme.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        debtorAccount: {
          select: {
            id: true,
            debtorCode: true,
            debtorName: true
          }
        }
      }
    });
  }

  async findAll(tenantId, options = {}) {
    const { 
      debtorAccountId, 
      status, 
      schemeType, 
      search, 
      limit = 50, 
      offset = 0 
    } = options;

    const where = {
      tenantId,
      ...(debtorAccountId ? { debtorAccountId } : {}),
      ...(status ? { status } : {}),
      ...(schemeType ? { schemeType } : {}),
      ...(search ? {
        OR: [
          { schemeName: { contains: search, mode: 'insensitive' } },
          { schemeCode: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } }
        ]
      } : {})
    };

    const [schemes, total] = await Promise.all([
      prisma.debtorScheme.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        include: {
          debtorAccount: {
            select: {
              id: true,
              debtorCode: true,
              debtorName: true,
              debtorType: true
            }
          }
        }
      }),
      prisma.debtorScheme.count({ where })
    ]);

    return { schemes, total };
  }

  async update(id, data, user) {
    const { tenantId, actorId } = user;
    
    return prisma.$transaction(async (tx) => {
      const existing = await tx.debtorScheme.findUnique({
        where: { id, tenantId }
      });

      if (!existing) {
        throw new Error("Scheme not found");
      }

      const previousValues = { ...existing };
      const newValues = { ...data };

      const scheme = await tx.debtorScheme.update({
        where: { id, tenantId },
        data: {
          ...data,
          updatedById: actorId
        },
        include: {
          debtorAccount: {
            select: {
              id: true,
              debtorCode: true,
              debtorName: true
            }
          }
        }
      });

      await tx.schemeAuditLog.create({
        data: {
          tenantId,
          debtorSchemeId: scheme.id,
          actorId,
          action: "SCHEME_UPDATED",
          entityType: "DebtorScheme",
          entityId: scheme.id,
          previousValues,
          newValues
        }
      });

      return scheme;
    });
  }

  async changeStatus(id, newStatus, reason, user) {
    const { tenantId, actorId } = user;
    
    const statusActionMap = {
      ACTIVE: "SCHEME_ACTIVATED",
      INACTIVE: "SCHEME_DEACTIVATED",
      SUSPENDED: "SCHEME_SUSPENDED",
      EXPIRED: "SCHEME_EXPIRED",
      ARCHIVED: "SCHEME_ARCHIVED"
    };

    return prisma.$transaction(async (tx) => {
      const scheme = await tx.debtorScheme.update({
        where: { id, tenantId },
        data: { 
          status: newStatus,
          updatedById: actorId
        },
        include: {
          debtorAccount: {
            select: {
              id: true,
              debtorCode: true,
              debtorName: true
            }
          }
        }
      });

      const action = statusActionMap[newStatus] || "SCHEME_UPDATED";

      await tx.schemeAuditLog.create({
        data: {
          tenantId,
          debtorSchemeId: scheme.id,
          actorId,
          action,
          entityType: "DebtorScheme",
          entityId: scheme.id,
          newValues: { status: newStatus },
          reason
        }
      });

      return scheme;
    });
  }

  async checkDuplicateCode(debtorAccountId, schemeCode, tenantId, excludeId = null) {
    const where = {
      debtorAccountId_schemeCode: {
        debtorAccountId,
        schemeCode
      },
      tenantId
    };

    if (excludeId) {
      where.id = { not: excludeId };
    }

    const existing = await prisma.debtorScheme.findFirst({ where });
    return !!existing;
  }

  async getActiveSchemesByDebtor(debtorAccountId, tenantId) {
    return prisma.debtorScheme.findMany({
      where: {
        debtorAccountId,
        tenantId,
        status: "ACTIVE"
      },
      include: {
        departmentRules: {
          where: { isActive: true },
          select: {
            departmentId: true,
            isAllowed: true,
            requiresAuthorization: true
          }
        },
        copaymentRules: {
          where: { isActive: true }
        },
        outpatientLimits: {
          where: { isActive: true }
        },
        visitLimits: {
          where: { isActive: true }
        }
      }
    });
  }
}

export const debtorSchemeRepository = new DebtorSchemeRepository();
