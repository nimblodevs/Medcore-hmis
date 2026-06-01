import prisma from "../../../config/prisma.js";


export const disputeRepository = {
  async findById(id) {
    return prisma.creditDispute.findUnique({
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

  async findByCaseId(caseId, { page = 1, limit = 20 } = {}) {
    const skip = (page - 1) * limit;

    const [disputes, total] = await Promise.all([
      prisma.creditDispute.findMany({
        where: { caseId },
        skip,
        take: limit,
        orderBy: { openedAt: "desc" },
      }),
      prisma.creditDispute.count({ where: { caseId } }),
    ]);

    return { disputes, total, page, limit };
  },

  async findByAccount(tenantId, branchId, creditAccountId) {
    return prisma.creditDispute.findMany({
      where: { tenantId, branchId, creditAccountId },
      orderBy: { openedAt: "desc" },
    });
  },

  async findOpenDisputes(tenantId, branchId) {
    return prisma.creditDispute.findMany({
      where: {
        tenantId,
        branchId,
        status: { in: ["OPEN", "UNDER_REVIEW"] },
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
      orderBy: { openedAt: "desc" },
    });
  },

  async create(data) {
    return prisma.creditDispute.create({ data });
  },

  async update(id, data) {
    return prisma.creditDispute.update({
      where: { id },
      data,
    });
  },

  async resolve(id, resolvedById, resolutionNotes, status = "RESOLVED") {
    return prisma.creditDispute.update({
      where: { id },
      data: {
        status,
        resolvedById,
        resolvedAt: new Date(),
        resolutionNotes,
      },
    });
  },

  async cancel(id, resolvedById, resolutionNotes) {
    return this.resolve(id, resolvedById, resolutionNotes, "CANCELLED");
  },

  async delete(id) {
    return prisma.creditDispute.delete({
      where: { id },
    });
  },
};
