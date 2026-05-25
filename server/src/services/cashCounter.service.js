import { PrismaClient } from "@prisma/client";
import ApiError from "../utils/apiError.js";
import { AuditService } from "./audit.service.js";

const prisma = new PrismaClient();
const auditService = new AuditService();

export class CashCounterService {
  async getAll(tenantId, branchId, options = {}) {
    const { search, status, page = 1, limit = 50 } = options;
    
    const where = {
      tenantId,
      deletedAt: null
    };

    if (branchId) {
      where.branchId = branchId;
    }

    if (status !== undefined) {
      where.isActive = status;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { code: { contains: search, mode: "insensitive" } },
        { department: { contains: search, mode: "insensitive" } }
      ];
    }

    const skip = (page - 1) * limit;
    const take = parseInt(limit, 10);

    const [counters, total] = await Promise.all([
      prisma.cashCounter.findMany({
        where,
        skip,
        take,
        include: {
          branch: { select: { id: true, name: true, code: true } },
          supervisor: { select: { id: true, firstName: true, lastName: true } }
        },
        orderBy: { createdAt: "desc" }
      }),
      prisma.cashCounter.count({ where })
    ]);

    return { data: counters, total, page, limit };
  }

  async getById(tenantId, id) {
    const counter = await prisma.cashCounter.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: {
        branch: { select: { id: true, name: true, code: true } },
        supervisor: { select: { id: true, firstName: true, lastName: true } }
      }
    });

    if (!counter) {
      throw new ApiError(404, "Cash counter not found");
    }

    return counter;
  }

  async create(tenantId, branchId, userId, data) {
    // Check for duplicate code within tenant and branch
    const existing = await prisma.cashCounter.findFirst({
      where: {
        tenantId,
        branchId,
        code: data.code,
        deletedAt: null
      }
    });

    if (existing) {
      throw new ApiError(400, "Counter code already exists for this branch");
    }

    const counter = await prisma.cashCounter.create({
      data: {
        tenantId,
        branchId,
        name: data.name,
        code: data.code,
        department: data.department,
        description: data.description,
        defaultCurrency: data.defaultCurrency || "KES",
        supervisorId: data.supervisorId,
        createdById: userId
      },
      include: {
        branch: { select: { id: true, name: true, code: true } }
      }
    });

    await auditService.log({
      tenantId,
      action: "CASH_COUNTER_CREATED",
      entityType: "CashCounter",
      entityId: counter.id,
      performedBy: userId,
      details: { counter }
    });

    return counter;
  }

  async update(tenantId, id, userId, data) {
    const existing = await this.getById(tenantId, id);

    if (data.code && data.code !== existing.code) {
      const duplicate = await prisma.cashCounter.findFirst({
        where: {
          tenantId,
          branchId: existing.branchId,
          code: data.code,
          deletedAt: null,
          id: { not: id }
        }
      });

      if (duplicate) {
        throw new ApiError(400, "Counter code already exists for this branch");
      }
    }

    const counter = await prisma.cashCounter.update({
      where: { id },
      data: {
        ...data,
        updatedById: userId
      },
      include: {
        branch: { select: { id: true, name: true, code: true } }
      }
    });

    await auditService.log({
      tenantId,
      action: "CASH_COUNTER_UPDATED",
      entityType: "CashCounter",
      entityId: counter.id,
      performedBy: userId,
      details: { changes: data }
    });

    return counter;
  }

  async delete(tenantId, id, userId) {
    await this.getById(tenantId, id);

    await prisma.cashCounter.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        updatedById: userId
      }
    });

    await auditService.log({
      tenantId,
      action: "CASH_COUNTER_DELETED",
      entityType: "CashCounter",
      entityId: id,
      performedBy: userId
    });

    return { success: true, message: "Cash counter deleted successfully" };
  }
}
