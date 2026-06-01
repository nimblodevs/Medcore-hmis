import prisma from "../../../config/prisma.js";


export const caseRepository = {
  async findById(id) {
    return prisma.creditControlCase.findUnique({
      where: { id },
      include: {
        followUps: { orderBy: { recordedAt: "desc" } },
        promises: { orderBy: { createdAt: "desc" } },
        disputes: { orderBy: { openedAt: "desc" } },
        holds: { orderBy: { recommendedAt: "desc" } },
        writeOffs: { orderBy: { recommendedAt: "desc" } },
        auditLogs: { orderBy: { createdAt: "desc" }, take: 50 },
      },
    });
  },

  async findByFilters({ tenantId, branchId, status, riskLevel, agingBucket, assignedCollectorId, creditAccountId, page = 1, limit = 20 }) {
    const where = { tenantId, branchId };

    if (status) where.status = status;
    if (riskLevel) where.riskLevel = riskLevel;
    if (agingBucket) where.agingBucket = agingBucket;
    if (assignedCollectorId) where.assignedCollectorId = assignedCollectorId;
    if (creditAccountId) where.creditAccountId = creditAccountId;

    const skip = (page - 1) * limit;

    const [cases, total] = await Promise.all([
      prisma.creditControlCase.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          tenant: { select: { id: true, name: true } },
          branch: { select: { id: true, name: true } },
        },
      }),
      prisma.creditControlCase.count({ where }),
    ]);

    return { cases, total, page, limit };
  },

  async findOpenCaseByAccount(tenantId, branchId, creditAccountId) {
    return prisma.creditControlCase.findFirst({
      where: {
        tenantId,
        branchId,
        creditAccountId,
        status: {
          notIn: ["CLOSED", "CANCELLED", "RESOLVED"],
        },
      },
    });
  },

  async create(data) {
    return prisma.creditControlCase.create({ data });
  },

  async update(id, data) {
    return prisma.creditControlCase.update({
      where: { id },
      data,
    });
  },

  async delete(id) {
    return prisma.creditControlCase.delete({
      where: { id },
    });
  },

  async countByStatus(tenantId, branchId, statuses) {
    return prisma.creditControlCase.count({
      where: {
        tenantId,
        branchId,
        status: { in: statuses },
      },
    });
  },

  async getDashboardStats(tenantId, branchId) {
    const [
      openCases,
      inProgressCases,
      promisedToPayCases,
      disputedCases,
      escalatedCases,
      onHoldCases,
      criticalRisk,
      highRisk,
      overdueFollowUps,
      overduePromises,
    ] = await Promise.all([
      prisma.creditControlCase.count({
        where: { tenantId, branchId, status: "OPEN" },
      }),
      prisma.creditControlCase.count({
        where: { tenantId, branchId, status: "IN_PROGRESS" },
      }),
      prisma.creditControlCase.count({
        where: { tenantId, branchId, status: "PROMISED_TO_PAY" },
      }),
      prisma.creditControlCase.count({
        where: { tenantId, branchId, status: "DISPUTED" },
      }),
      prisma.creditControlCase.count({
        where: { tenantId, branchId, status: "ESCALATED" },
      }),
      prisma.creditControlCase.count({
        where: { tenantId, branchId, status: "ON_HOLD" },
      }),
      prisma.creditControlCase.count({
        where: { tenantId, branchId, riskLevel: "CRITICAL" },
      }),
      prisma.creditControlCase.count({
        where: { tenantId, branchId, riskLevel: "HIGH" },
      }),
      prisma.creditControlFollowUp.count({
        where: {
          tenantId,
          branchId,
          nextFollowUpAt: { lt: new Date() },
          case: { status: { notIn: ["CLOSED", "CANCELLED", "RESOLVED"] } },
        },
      }),
      prisma.promiseToPay.count({
        where: {
          tenantId,
          branchId,
          promisedDate: { lt: new Date() },
          isFulfilled: false,
          case: { status: { notIn: ["CLOSED", "CANCELLED", "RESOLVED"] } },
        },
      }),
    ]);

    return {
      openCases,
      inProgressCases,
      promisedToPayCases,
      disputedCases,
      escalatedCases,
      onHoldCases,
      criticalRisk,
      highRisk,
      overdueFollowUps,
      overduePromises,
    };
  },
};
