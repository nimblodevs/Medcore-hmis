import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const writeOffRepository = {
  async findById(id) {
    return prisma.writeOffRecommendation.findUnique({
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

    const [writeOffs, total] = await Promise.all([
      prisma.writeOffRecommendation.findMany({
        where: { caseId },
        skip,
        take: limit,
        orderBy: { recommendedAt: "desc" },
      }),
      prisma.writeOffRecommendation.count({ where: { caseId } }),
    ]);

    return { writeOffs, total, page, limit };
  },

  async findByAccount(tenantId, branchId, creditAccountId) {
    return prisma.writeOffRecommendation.findMany({
      where: { tenantId, branchId, creditAccountId },
      orderBy: { recommendedAt: "desc" },
    });
  },

  async findPendingRecommendations(tenantId, branchId) {
    return prisma.writeOffRecommendation.findMany({
      where: {
        tenantId,
        branchId,
        status: "PENDING",
      },
      include: {
        case: {
          select: {
            id: true,
            caseNumber: true,
            creditAccountId: true,
            status: true,
            riskLevel: true,
            outstandingAmount: true,
          },
        },
      },
      orderBy: { recommendedAt: "desc" },
    });
  },

  async findApprovedWriteOffs(tenantId, branchId) {
    return prisma.writeOffRecommendation.findMany({
      where: {
        tenantId,
        branchId,
        status: { in: ["APPROVED", "POSTED"] },
      },
      include: {
        case: {
          select: {
            id: true,
            caseNumber: true,
            creditAccountId: true,
          },
        },
      },
      orderBy: { approvedAt: "desc" },
    });
  },

  async create(data) {
    return prisma.writeOffRecommendation.create({ data });
  },

  async update(id, data) {
    return prisma.writeOffRecommendation.update({
      where: { id },
      data,
    });
  },

  async approve(id, approvedById) {
    return prisma.writeOffRecommendation.update({
      where: { id },
      data: {
        status: "APPROVED",
        approvedById,
        approvedAt: new Date(),
      },
    });
  },

  async reject(id, rejectedById, rejectionReason) {
    return prisma.writeOffRecommendation.update({
      where: { id },
      data: {
        status: "REJECTED",
        rejectedById,
        rejectedAt: new Date(),
        rejectionReason,
      },
    });
  },

  async markPosted(id, postedAdjustmentId) {
    return prisma.writeOffRecommendation.update({
      where: { id },
      data: {
        status: "POSTED",
        postedAdjustmentId,
        postedAt: new Date(),
      },
    });
  },

  async delete(id) {
    return prisma.writeOffRecommendation.delete({
      where: { id },
    });
  },
};
