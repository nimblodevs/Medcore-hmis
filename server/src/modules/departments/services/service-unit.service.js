import prisma from "../../prisma.js";
import { departmentAuditService } from "./department-audit.service.js";

export const serviceUnitService = {
  async createServiceUnit(departmentId, data, actorId) {
    const existing = await prisma.serviceUnit.findUnique({
      where: { code: data.code }
    });

    if (existing) {
      throw new Error("Service unit code already exists");
    }

    const department = await prisma.department.findUnique({
      where: { id: departmentId }
    });

    if (!department) {
      throw new Error("Department not found");
    }

    const serviceUnit = await prisma.$transaction(async (tx) => {
      const su = await tx.serviceUnit.create({
        data: {
          ...data,
          departmentId,
          createdById: actorId
        }
      });

      await departmentAuditService.logAction(
        departmentId,
        actorId,
        "SERVICE_UNIT_CREATED",
        "ServiceUnit",
        su.id,
        null,
        data
      );

      return su;
    });

    return serviceUnit;
  },

  async getServiceUnit(id) {
    const serviceUnit = await prisma.serviceUnit.findUnique({
      where: { id },
      include: {
        department: {
          select: {
            id: true,
            name: true,
            code: true,
            status: true
          }
        }
      }
    });

    if (!serviceUnit) {
      throw new Error("Service unit not found");
    }

    return serviceUnit;
  },

  async listServiceUnits(departmentId, filters = {}) {
    const {
      status,
      search,
      page = 1,
      limit = 20
    } = filters;

    const where = {
      departmentId
    };

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [serviceUnits, total] = await Promise.all([
      prisma.serviceUnit.findMany({
        where,
        include: {
          department: {
            select: {
              id: true,
              name: true,
              code: true
            }
          }
        },
        orderBy: { name: 'asc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.serviceUnit.count({ where })
    ]);

    return {
      data: serviceUnits,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  },

  async updateServiceUnit(id, data, actorId) {
    const existing = await prisma.serviceUnit.findUnique({
      where: { id },
      include: {
        department: true
      }
    });

    if (!existing) {
      throw new Error("Service unit not found");
    }

    if (data.code && data.code !== existing.code) {
      const codeExists = await prisma.serviceUnit.findUnique({
        where: { code: data.code }
      });
      if (codeExists) {
        throw new Error("Service unit code already exists");
      }
    }

    const previousValues = {
      name: existing.name,
      code: existing.code,
      description: existing.description,
      location: existing.location
    };

    const serviceUnit = await prisma.$transaction(async (tx) => {
      const updated = await tx.serviceUnit.update({
        where: { id },
        data: {
          ...data,
          updatedById: actorId
        },
        include: {
          department: {
            select: {
              id: true,
              name: true,
              code: true
            }
          }
        }
      });

      await departmentAuditService.logAction(
        existing.departmentId,
        actorId,
        "SERVICE_UNIT_UPDATED",
        "ServiceUnit",
        id,
        previousValues,
        data
      );

      return updated;
    });

    return serviceUnit;
  },

  async activateServiceUnit(id, actorId, reason = null) {
    const serviceUnit = await this.getServiceUnit(id);

    if (serviceUnit.status === "ACTIVE") {
      throw new Error("Service unit is already active");
    }

    const updated = await prisma.$transaction(async (tx) => {
      const su = await tx.serviceUnit.update({
        where: { id },
        data: { status: "ACTIVE" }
      });

      await departmentAuditService.logAction(
        serviceUnit.departmentId,
        actorId,
        "SERVICE_UNIT_ACTIVATED",
        "ServiceUnit",
        id,
        { status: serviceUnit.status },
        { status: "ACTIVE" },
        reason
      );

      return su;
    });

    return updated;
  },

  async deactivateServiceUnit(id, actorId, reason = null) {
    const serviceUnit = await this.getServiceUnit(id);

    if (serviceUnit.status === "INACTIVE" || serviceUnit.status === "ARCHIVED") {
      throw new Error("Service unit is already inactive or archived");
    }

    const updated = await prisma.$transaction(async (tx) => {
      const su = await tx.serviceUnit.update({
        where: { id },
        data: { status: "INACTIVE" }
      });

      await departmentAuditService.logAction(
        serviceUnit.departmentId,
        actorId,
        "SERVICE_UNIT_DEACTIVATED",
        "ServiceUnit",
        id,
        { status: serviceUnit.status },
        { status: "INACTIVE" },
        reason
      );

      return su;
    });

    return updated;
  },

  async archiveServiceUnit(id, actorId, reason = null) {
    const serviceUnit = await this.getServiceUnit(id);

    if (serviceUnit.status === "ARCHIVED") {
      throw new Error("Service unit is already archived");
    }

    const updated = await prisma.$transaction(async (tx) => {
      const su = await tx.serviceUnit.update({
        where: { id },
        data: { status: "ARCHIVED" }
      });

      await departmentAuditService.logAction(
        serviceUnit.departmentId,
        actorId,
        "SERVICE_UNIT_ARCHIVED",
        "ServiceUnit",
        id,
        { status: serviceUnit.status },
        { status: "ARCHIVED" },
        reason
      );

      return su;
    });

    return updated;
  }
};
