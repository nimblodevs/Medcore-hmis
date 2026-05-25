import prisma from "../../../config/prisma.js";
import { departmentAuditService } from "./department-audit.service.js";

export const departmentAssignmentService = {
  async assignUserToDepartment(departmentId, userId, serviceUnitId, isPrimary, actorId) {
    const department = await prisma.department.findUnique({
      where: { id: departmentId }
    });

    if (!department) {
      throw new Error("Department not found");
    }

    // Check for existing assignment
    const existing = await prisma.departmentUserAssignment.findFirst({
      where: {
        departmentId,
        userId,
        serviceUnitId: serviceUnitId || null,
        isActive: true
      }
    });

    if (existing) {
      throw new Error("User is already assigned to this department/service unit");
    }

    // If isPrimary, remove other primary assignments for this user in this department
    if (isPrimary) {
      await prisma.departmentUserAssignment.updateMany({
        where: {
          departmentId,
          userId,
          isPrimary: true
        },
        data: { isPrimary: false }
      });
    }

    const assignment = await prisma.$transaction(async (tx) => {
      const newAssignment = await tx.departmentUserAssignment.create({
        data: {
          departmentId,
          userId,
          serviceUnitId,
          isPrimary,
          assignedById: actorId
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
        departmentId,
        actorId,
        "USER_ASSIGNED",
        "DepartmentUserAssignment",
        newAssignment.id,
        null,
        { userId, serviceUnitId, isPrimary }
      );

      return newAssignment;
    });

    return assignment;
  },

  async removeUserFromDepartment(departmentId, userId, serviceUnitId, actorId) {
    const assignment = await prisma.departmentUserAssignment.findFirst({
      where: {
        departmentId,
        userId,
        serviceUnitId: serviceUnitId || null,
        isActive: true
      }
    });

    if (!assignment) {
      throw new Error("User assignment not found");
    }

    const updated = await prisma.$transaction(async (tx) => {
      const removed = await tx.departmentUserAssignment.update({
        where: { id: assignment.id },
        data: {
          isActive: false,
          removedById: actorId,
          removedAt: new Date()
        }
      });

      await departmentAuditService.logAction(
        departmentId,
        actorId,
        "USER_REMOVED",
        "DepartmentUserAssignment",
        assignment.id,
        { isActive: true },
        { isActive: false }
      );

      return removed;
    });

    return updated;
  },

  async getDepartmentUsers(departmentId, filters = {}) {
    const {
      isActive = true,
      serviceUnitId,
      page = 1,
      limit = 50
    } = filters;

    const where = {
      departmentId
    };

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    if (serviceUnitId) {
      where.serviceUnitId = serviceUnitId;
    }

    const [assignments, total] = await Promise.all([
      prisma.departmentUserAssignment.findMany({
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
        orderBy: { assignedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.departmentUserAssignment.count({ where })
    ]);

    return {
      data: assignments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  },

  async getUserDepartments(userId, filters = {}) {
    const {
      isActive = true,
      includeInactiveDepartments = false
    } = filters;

    const where = {
      userId
    };

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    if (!includeInactiveDepartments) {
      where.department = {
        status: "ACTIVE"
      };
    }

    const assignments = await prisma.departmentUserAssignment.findMany({
      where,
      include: {
        department: {
          select: {
            id: true,
            name: true,
            code: true,
            status: true,
            departmentType: true
          }
        },
        serviceUnit: {
          select: {
            id: true,
            name: true,
            code: true,
            status: true
          }
        }
      },
      orderBy: { assignedAt: 'desc' }
    });

    return assignments;
  },

  async assignManager(departmentId, managerId, actorId) {
    const department = await prisma.department.findUnique({
      where: { id: departmentId }
    });

    if (!department) {
      throw new Error("Department not found");
    }

    const previousManagerId = department.managerId;

    const updated = await prisma.$transaction(async (tx) => {
      const dept = await tx.department.update({
        where: { id: departmentId },
        data: { managerId }
      });

      await departmentAuditService.logAction(
        departmentId,
        actorId,
        "MANAGER_ASSIGNED",
        "Department",
        departmentId,
        { managerId: previousManagerId },
        { managerId }
      );

      return dept;
    });

    return updated;
  }
};
