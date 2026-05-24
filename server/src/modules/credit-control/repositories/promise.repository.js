import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const promiseRepository = {
  async findById(id) {
    return prisma.promiseToPay.findUnique({
      where: { id },
      include: {
        case: {
          select: {
            id: true,
            caseNumber: true,
            creditAccountId: true,
            outstandingAmount: true,
          },
        },
      },
    });
  },

  async findByCaseId(caseId, { page = 1, limit = 20 } = {}) {
    const skip = (page - 1) * limit;

    const [promises, total] = await Promise.all([
      prisma.promiseToPay.findMany({
        where: { caseId },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.promiseToPay.count({ where: { caseId } }),
    ]);

    return { promises, total, page, limit };
  },

  async findOverdue(tenantId, branchId) {
    return prisma.promiseToPay.findMany({
      where: {
        tenantId,
        branchId,
        promisedDate: { lt: new Date() },
        isFulfilled: false,
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
            outstandingAmount: true,
          },
        },
      },
      orderBy: { promisedDate: "asc" },
    });
  },

  async findDueToday(tenantId, branchId) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return prisma.promiseToPay.findMany({
      where: {
        tenantId,
        branchId,
        promisedDate: {
          gte: today,
          lt: tomorrow,
        },
        isFulfilled: false,
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
    });
  },

  async create(data) {
    return prisma.promiseToPay.create({ data });
  },

  async update(id, data) {
    return prisma.promiseToPay.update({
      where: { id },
      data,
    });
  },

  async markFulfilled(id, fulfilledAmount) {
    return prisma.promiseToPay.update({
      where: { id },
      data: {
        isFulfilled: true,
        fulfilledAt: new Date(),
        fulfilledAmount,
      },
    });
  },

  async delete(id) {
    return prisma.promiseToPay.delete({
      where: { id },
    });
  },
};
