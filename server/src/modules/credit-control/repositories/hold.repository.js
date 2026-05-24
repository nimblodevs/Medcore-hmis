import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const holdRepository = {
  async findById(id) {
    return prisma.creditHold.findUnique({
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

  async findByAccount(tenantId, branchId, creditAccountId) {
    return prisma.creditHold.findMany({
      where: { tenantId, branchId, creditAccountId },
      orderBy: { recommendedAt: "desc" },
    });
  },

  async findActiveHolds(tenantId, branchId) {
    return prisma.creditHold.findMany({
      where: {
        tenantId,
        branchId,
        status: "ACTIVE",
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
      orderBy: { approvedAt: "desc" },
    });
  },

  async findRecommendedHolds(tenantId, branchId) {
    return prisma.creditHold.findMany({
      where: {
        tenantId,
        branchId,
        status: "RECOMMENDED",
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

  async create(data) {
    return prisma.creditHold.create({ data });
  },

  async update(id, data) {
    return prisma.creditHold.update({
      where: { id },
      data,
    });
  },

  async approve(id, approvedById) {
    return prisma.creditHold.update({
      where: { id },
      data: {
        status: "APPROVED",
        approvedById,
        approvedAt: new Date(),
      },
    });
  },

  async reject(id, rejectedById, rejectionReason) {
    return prisma.creditHold.update({
      where: { id },
      data: {
        status: "REJECTED",
        rejectedById,
        rejectedAt: new Date(),
        rejectionReason,
      },
    });
  },

  async release(id, releasedById, releaseReason) {
    return prisma.creditHold.update({
      where: { id },
      data: {
        status: "RELEASED",
        releasedById,
        releasedAt: new Date(),
        releaseReason,
      },
    });
  },

  async delete(id) {
    return prisma.creditHold.delete({
      where: { id },
    });
  },
};
