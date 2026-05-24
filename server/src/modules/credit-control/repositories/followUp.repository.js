import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const followUpRepository = {
  async findById(id) {
    return prisma.creditControlFollowUp.findUnique({
      where: { id },
      include: {
        case: {
          select: {
            id: true,
            caseNumber: true,
            creditAccountId: true,
          },
        },
      },
    });
  },

  async findByCaseId(caseId, { page = 1, limit = 50 } = {}) {
    const skip = (page - 1) * limit;

    const [followUps, total] = await Promise.all([
      prisma.creditControlFollowUp.findMany({
        where: { caseId },
        skip,
        take: limit,
        orderBy: { recordedAt: "desc" },
      }),
      prisma.creditControlFollowUp.count({ where: { caseId } }),
    ]);

    return { followUps, total, page, limit };
  },

  async findDueToday(tenantId, branchId) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return prisma.creditControlFollowUp.findMany({
      where: {
        tenantId,
        branchId,
        nextFollowUpAt: {
          gte: today,
          lt: tomorrow,
        },
        case: {
          status: { notIn: ["CLOSED", "CANCELLED", "RESOLVED"] },
        },
      },
      include: {
        case: {
          select: {
            id: true,
            caseNumber: true,
            creditAccountId: true,
            status: true,
            riskLevel: true,
          },
        },
      },
      orderBy: { nextFollowUpAt: "asc" },
    });
  },

  async findOverdue(tenantId, branchId) {
    return prisma.creditControlFollowUp.findMany({
      where: {
        tenantId,
        branchId,
        nextFollowUpAt: { lt: new Date() },
        case: {
          status: { notIn: ["CLOSED", "CANCELLED", "RESOLVED"] },
        },
      },
      include: {
        case: {
          select: {
            id: true,
            caseNumber: true,
            creditAccountId: true,
            status: true,
            riskLevel: true,
          },
        },
      },
      orderBy: { nextFollowUpAt: "asc" },
    });
  },

  async findByCollector(tenantId, branchId, collectorId) {
    return prisma.creditControlFollowUp.findMany({
      where: {
        tenantId,
        branchId,
        case: {
          assignedCollectorId: collectorId,
          status: { notIn: ["CLOSED", "CANCELLED", "RESOLVED"] },
        },
      },
      include: {
        case: {
          select: {
            id: true,
            caseNumber: true,
            creditAccountId: true,
            status: true,
            riskLevel: true,
          },
        },
      },
      orderBy: { nextFollowUpAt: "asc" },
    });
  },

  async create(data) {
    return prisma.creditControlFollowUp.create({ data });
  },

  async update(id, data) {
    return prisma.creditControlFollowUp.update({
      where: { id },
      data,
    });
  },

  async delete(id) {
    return prisma.creditControlFollowUp.delete({
      where: { id },
    });
  },
};
