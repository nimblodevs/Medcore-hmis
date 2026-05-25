import prisma from "../../../config/prisma.js";
import { departmentAuditService } from "./department-audit.service.js";

export const departmentService = {
  async createDepartment(data, actorId) {
    const existing = await prisma.department.findUnique({
      where: { code: data.code }
    });

    if (existing) {
      throw new Error("Department code already exists");
    }

    const department = await prisma.$transaction(async (tx) => {
      const dept = await tx.department.create({
        data: {
          ...data,
          createdById: actorId
        },
        include: {
          serviceUnits: true
        }
      });

      await departmentAuditService.logAction(
        dept.id,
        actorId,
        "DEPARTMENT_CREATED",
        "Department",
        dept.id,
        null,
        data
      );

      return dept;
    });

    return department;
  },

  async getDepartment(id) {
    const department = await prisma.department.findUnique({
      where: { id },
      include: {
        serviceUnits: {
          where: { status: { not: "ARCHIVED" } },
          orderBy: { name: 'asc' }
        },
        userAssignments: {
          where: { isActive: true },
          include: {
            department: {
              select: {
                id: true,
                name: true,
                code: true
              }
            }
          }
        }
      }
    });

    if (!department) {
      throw new Error("Department not found");
    }

    return department;
  },

  async listDepartments(filters = {}) {
    const {
      status,
      departmentType,
      search,
      page = 1,
      limit = 20
    } = filters;

    const where = {};

    if (status) {
      where.status = status;
    }

    if (departmentType) {
      where.departmentType = departmentType;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [departments, total] = await Promise.all([
      prisma.department.findMany({
        where,
        include: {
          serviceUnits: {
            where: { status: "ACTIVE" },
            select: {
              id: true,
              name: true,
              code: true,
              status: true
            }
          }
        },
        orderBy: { name: 'asc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.department.count({ where })
    ]);

    return {
      data: departments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  },

  async updateDepartment(id, data, actorId) {
    const existing = await prisma.department.findUnique({
      where: { id }
    });

    if (!existing) {
      throw new Error("Department not found");
    }

    if (data.code && data.code !== existing.code) {
      const codeExists = await prisma.department.findUnique({
        where: { code: data.code }
      });
      if (codeExists) {
        throw new Error("Department code already exists");
      }
    }

    const previousValues = {
      name: existing.name,
      code: existing.code,
      description: existing.description,
      departmentType: existing.departmentType,
      managerId: existing.managerId,
      location: existing.location,
      phone: existing.phone,
      email: existing.email
    };

    const department = await prisma.$transaction(async (tx) => {
      const updated = await tx.department.update({
        where: { id },
        data: {
          ...data,
          updatedById: actorId
        },
        include: {
          serviceUnits: true
        }
      });

      await departmentAuditService.logAction(
        id,
        actorId,
        "DEPARTMENT_UPDATED",
        "Department",
        id,
        previousValues,
        data
      );

      return updated;
    });

    return department;
  },

  async activateDepartment(id, actorId, reason = null) {
    const department = await this.getDepartment(id);

    if (department.status === "ACTIVE") {
      throw new Error("Department is already active");
    }

    const updated = await prisma.$transaction(async (tx) => {
      const dept = await tx.department.update({
        where: { id },
        data: { status: "ACTIVE" }
      });

      await departmentAuditService.logAction(
        id,
        actorId,
        "DEPARTMENT_ACTIVATED",
        "Department",
        id,
        { status: department.status },
        { status: "ACTIVE" },
        reason
      );

      return dept;
    });

    return updated;
  },

  async deactivateDepartment(id, actorId, reason = null) {
    const department = await this.getDepartment(id);

    if (department.status === "INACTIVE" || department.status === "ARCHIVED") {
      throw new Error("Department is already inactive or archived");
    }

    // Check for active service units
    const activeServiceUnits = await prisma.serviceUnit.count({
      where: {
        departmentId: id,
        status: "ACTIVE"
      }
    });

    if (activeServiceUnits > 0) {
      throw new Error(`Cannot deactivate department with ${activeServiceUnits} active service unit(s). Deactivate service units first.`);
    }

    const updated = await prisma.$transaction(async (tx) => {
      const dept = await tx.department.update({
        where: { id },
        data: { status: "INACTIVE" }
      });

      await departmentAuditService.logAction(
        id,
        actorId,
        "DEPARTMENT_DEACTIVATED",
        "Department",
        id,
        { status: department.status },
        { status: "INACTIVE" },
        reason
      );

      return dept;
    });

    return updated;
  },

  async archiveDepartment(id, actorId, reason = null) {
    const department = await this.getDepartment(id);

    if (department.status === "ARCHIVED") {
      throw new Error("Department is already archived");
    }

    const updated = await prisma.$transaction(async (tx) => {
      const dept = await tx.department.update({
        where: { id },
        data: { status: "ARCHIVED" }
      });

      await departmentAuditService.logAction(
        id,
        actorId,
        "DEPARTMENT_ARCHIVED",
        "Department",
        id,
        { status: department.status },
        { status: "ARCHIVED" },
        reason
      );

      return dept;
    });

    return updated;
  },

  async assignManager(id, managerId, actorId) {
    const department = await this.getDepartment(id);

    const updated = await prisma.$transaction(async (tx) => {
      const dept = await tx.department.update({
        where: { id },
        data: { managerId }
      });

      await departmentAuditService.logAction(
        id,
        actorId,
        "MANAGER_ASSIGNED",
        "Department",
        id,
        { managerId: department.managerId },
        { managerId }
      );

      return dept;
    });

    return updated;
  },

  async getDashboardStats() {
    const [
      total,
      active,
      inactive,
      archived,
      totalServiceUnits,
      withoutManager
    ] = await Promise.all([
      prisma.department.count(),
      prisma.department.count({ where: { status: "ACTIVE" } }),
      prisma.department.count({ where: { status: "INACTIVE" } }),
      prisma.department.count({ where: { status: "ARCHIVED" } }),
      prisma.serviceUnit.count(),
      prisma.department.count({
        where: {
          status: "ACTIVE",
          OR: [
            { managerId: null },
            { managerId: undefined }
          ]
        }
      })
    ]);

    return {
      totalDepartments: total,
      activeDepartments: active,
      inactiveDepartments: inactive,
      archivedDepartments: archived,
      totalServiceUnits,
      departmentsWithoutManager: withoutManager
    };
  }
};
