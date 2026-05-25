import { PrismaClient } from "@prisma/client";
import ApiError from "../utils/apiError.js";
import { AuditService } from "./audit.service.js";

const prisma = new PrismaClient();
const auditService = new AuditService();

export class CashierProfileService {
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
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { staffNumber: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } }
      ];
    }

    const skip = (page - 1) * limit;
    const take = parseInt(limit, 10);

    const [profiles, total] = await Promise.all([
      prisma.cashierProfile.findMany({
        where,
        skip,
        take,
        include: {
          branch: { select: { id: true, name: true, code: true } },
          user: { select: { id: true, email: true, phone: true } },
          defaultCounter: { select: { id: true, name: true, code: true } }
        },
        orderBy: { createdAt: "desc" }
      }),
      prisma.cashierProfile.count({ where })
    ]);

    return { data: profiles, total, page, limit };
  }

  async getById(tenantId, id) {
    const profile = await prisma.cashierProfile.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: {
        branch: { select: { id: true, name: true, code: true } },
        user: { select: { id: true, email: true, phone: true, firstName: true, lastName: true } },
        defaultCounter: { select: { id: true, name: true, code: true } }
      }
    });

    if (!profile) {
      throw new ApiError(404, "Cashier profile not found");
    }

    return profile;
  }

  async getByUserId(tenantId, userId) {
    const profile = await prisma.cashierProfile.findFirst({
      where: { userId, tenantId, deletedAt: null },
      include: {
        branch: { select: { id: true, name: true, code: true } },
        defaultCounter: { select: { id: true, name: true, code: true } }
      }
    });

    return profile;
  }

  async create(tenantId, branchId, userId, data) {
    // Check for duplicate staff number
    const existingByStaff = await prisma.cashierProfile.findFirst({
      where: {
        tenantId,
        staffNumber: data.staffNumber,
        deletedAt: null
      }
    });

    if (existingByStaff) {
      throw new ApiError(400, "Staff number already exists");
    }

    // Check if user already has a cashier profile
    const existingByUser = await prisma.cashierProfile.findFirst({
      where: {
        tenantId,
        userId: data.userId,
        deletedAt: null
      }
    });

    if (existingByUser) {
      throw new ApiError(400, "User already has a cashier profile");
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: data.userId }
    });

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const profile = await prisma.cashierProfile.create({
      data: {
        tenantId,
        branchId,
        userId: data.userId,
        staffNumber: data.staffNumber,
        firstName: data.firstName || user.firstName,
        lastName: data.lastName || user.lastName,
        email: data.email || user.email,
        phone: data.phone || user.phone,
        department: data.department,
        defaultCounterId: data.defaultCounterId,
        supervisorId: data.supervisorId,
        createdById: userId
      },
      include: {
        branch: { select: { id: true, name: true, code: true } },
        user: { select: { id: true, email: true, phone: true } }
      }
    });

    await auditService.log({
      tenantId,
      action: "CASHIER_PROFILE_CREATED",
      entityType: "CashierProfile",
      entityId: profile.id,
      performedBy: userId,
      details: { profile }
    });

    return profile;
  }

  async update(tenantId, id, userId, data) {
    const existing = await this.getById(tenantId, id);

    if (data.staffNumber && data.staffNumber !== existing.staffNumber) {
      const duplicate = await prisma.cashierProfile.findFirst({
        where: {
          tenantId,
          staffNumber: data.staffNumber,
          deletedAt: null,
          id: { not: id }
        }
      });

      if (duplicate) {
        throw new ApiError(400, "Staff number already exists");
      }
    }

    const profile = await prisma.cashierProfile.update({
      where: { id },
      data: {
        ...data,
        updatedById: userId
      },
      include: {
        branch: { select: { id: true, name: true, code: true } },
        user: { select: { id: true, email: true, phone: true } }
      }
    });

    await auditService.log({
      tenantId,
      action: "CASHIER_PROFILE_UPDATED",
      entityType: "CashierProfile",
      entityId: profile.id,
      performedBy: userId,
      details: { changes: data }
    });

    return profile;
  }

  async delete(tenantId, id, userId) {
    await this.getById(tenantId, id);

    await prisma.cashierProfile.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        updatedById: userId
      }
    });

    await auditService.log({
      tenantId,
      action: "CASHIER_PROFILE_DELETED",
      entityType: "CashierProfile",
      entityId: id,
      performedBy: userId
    });

    return { success: true, message: "Cashier profile deleted successfully" };
  }
}
