import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const auditRepository = {
  async create(data) {
    return prisma.creditControlAuditLog.create({ data });
  },

  async findByCaseId(caseId, { page = 1, limit = 50 } = {}) {
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      prisma.creditControlAuditLog.findMany({
        where: { caseId },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.creditControlAuditLog.count({ where: { caseId } }),
    ]);

    return { logs, total, page, limit };
  },

  async findByAccount(tenantId, branchId, creditAccountId, { page = 1, limit = 50 } = {}) {
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      prisma.creditControlAuditLog.findMany({
        where: { tenantId, branchId, creditAccountId },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.creditControlAuditLog.count({ where: { tenantId, branchId, creditAccountId } }),
    ]);

    return { logs, total, page, limit };
  },

  async findByActor(actorId, { page = 1, limit = 50 } = {}) {
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      prisma.creditControlAuditLog.findMany({
        where: { actorId },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.creditControlAuditLog.count({ where: { actorId } }),
    ]);

    return { logs, total, page, limit };
  },

  async findByAction(tenantId, branchId, action, { page = 1, limit = 50 } = {}) {
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      prisma.creditControlAuditLog.findMany({
        where: { tenantId, branchId, action },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.creditControlAuditLog.count({ where: { tenantId, branchId, action } }),
    ]);

    return { logs, total, page, limit };
  },

  async findRecent(tenantId, branchId, limit = 100) {
    return prisma.creditControlAuditLog.findMany({
      where: { tenantId, branchId },
      take: limit,
      orderBy: { createdAt: "desc" },
    });
  },
};
