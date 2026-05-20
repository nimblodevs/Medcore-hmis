import prisma from "../config/prisma.js";
import ApiError from "../utils/apiError.js";
import { hashPassword } from "../utils/password.js";

export const listUsers = async ({ tenantId, isSuperAdmin }) => {
  return prisma.user.findMany({
    where: {
      deletedAt: null,
      ...(isSuperAdmin ? {} : { tenantId })
    },
    include: {
      roles: {
        where: { deletedAt: null },
        include: { role: true }
      },
      branches: {
        where: { deletedAt: null },
        include: { branch: true }
      },
      primaryDepartment: true,
      departments: {
        where: { deletedAt: null },
        include: { department: true }
      }
    },
    orderBy: { createdAt: "desc" }
  });
};

export const createUser = async (payload, actor, context) => {
  const tenantId = context.tenantId || payload.tenantId;
  if (!tenantId && !actor.isSuperAdmin) throw new ApiError(400, "tenantId is required");

  const existing = await prisma.user.findUnique({ where: { email: payload.email } });
  if (existing) throw new ApiError(409, "Email already exists");

  if (payload.primaryDepartmentId) {
    const department = await prisma.department.findFirst({
      where: {
        id: payload.primaryDepartmentId,
        tenantId,
        deletedAt: null
      }
    });
    if (!department) throw new ApiError(400, "primaryDepartmentId is invalid for this tenant");
  }

  return prisma.user.create({
    data: {
      firstName: payload.firstName,
      middleName: payload.middleName,
      lastName: payload.lastName,
      email: payload.email,
      phone: payload.phone,
      staffId: payload.staffId,
      jobTitle: payload.jobTitle,
      gender: payload.gender,
      dateOfBirth: payload.dateOfBirth,
      address: payload.address,
      primaryDepartmentId: payload.primaryDepartmentId,
      passwordHash: await hashPassword(payload.password),
      tenantId: tenantId || null,
      createdById: actor.userId,
      updatedById: actor.userId
    }
  });
};

export const updateUser = async (id, payload, actor, context) => {
  const user = await prisma.user.findFirst({
    where: {
      id,
      deletedAt: null,
      ...(context.tenantId ? { tenantId: context.tenantId } : {})
    }
  });
  if (!user) throw new ApiError(404, "User not found");

  if (payload.primaryDepartmentId) {
    const department = await prisma.department.findFirst({
      where: {
        id: payload.primaryDepartmentId,
        tenantId: user.tenantId || context.tenantId,
        deletedAt: null
      }
    });
    if (!department) throw new ApiError(400, "primaryDepartmentId is invalid for this tenant");
  }

  return prisma.user.update({
    where: { id },
    data: { ...payload, updatedById: actor.userId }
  });
};

export const assignRoles = async (userId, roleIds, actor, context) => {
  const user = await prisma.user.findFirst({
    where: {
      id: userId,
      deletedAt: null,
      ...(context.tenantId ? { tenantId: context.tenantId } : {})
    }
  });
  if (!user) throw new ApiError(404, "User not found");

  await prisma.userRole.deleteMany({
    where: { userId, tenantId: user.tenantId || context.tenantId }
  });
  await prisma.userRole.createMany({
    data: roleIds.map((roleId) => ({
      tenantId: user.tenantId || context.tenantId,
      userId,
      roleId,
      createdById: actor.userId,
      updatedById: actor.userId
    }))
  });

  return { userId, roleIds };
};

export const assignBranches = async (userId, branchIds, actor, context) => {
  const user = await prisma.user.findFirst({
    where: {
      id: userId,
      deletedAt: null,
      ...(context.tenantId ? { tenantId: context.tenantId } : {})
    }
  });
  if (!user) throw new ApiError(404, "User not found");

  await prisma.userBranch.deleteMany({
    where: { userId, tenantId: user.tenantId || context.tenantId }
  });
  await prisma.userBranch.createMany({
    data: branchIds.map((branchId) => ({
      tenantId: user.tenantId || context.tenantId,
      userId,
      branchId,
      createdById: actor.userId,
      updatedById: actor.userId
    }))
  });

  return { userId, branchIds };
};

export const assignDepartments = async (userId, payload, actor, context) => {
  const user = await prisma.user.findFirst({
    where: {
      id: userId,
      deletedAt: null,
      ...(context.tenantId ? { tenantId: context.tenantId } : {})
    }
  });
  if (!user) throw new ApiError(404, "User not found");

  const tenantId = user.tenantId || context.tenantId;
  const departments = await prisma.department.findMany({
    where: {
      id: { in: payload.departmentIds },
      tenantId,
      deletedAt: null
    },
    select: { id: true, branchId: true }
  });
  if (departments.length !== payload.departmentIds.length) {
    throw new ApiError(400, "One or more departments are invalid for this tenant");
  }

  await prisma.userDepartment.deleteMany({
    where: { userId, tenantId }
  });
  await prisma.userDepartment.createMany({
    data: payload.departmentIds.map((departmentId) => {
      const department = departments.find((item) => item.id === departmentId);
      return {
        tenantId,
        branchId: department?.branchId || null,
        userId,
        departmentId,
        createdById: actor.userId,
        updatedById: actor.userId
      };
    })
  });

  const nextPrimaryDepartmentId = payload.primaryDepartmentId || payload.departmentIds[0];
  await prisma.user.update({
    where: { id: userId },
    data: {
      primaryDepartmentId: nextPrimaryDepartmentId,
      updatedById: actor.userId
    }
  });

  return { userId, departmentIds: payload.departmentIds, primaryDepartmentId: nextPrimaryDepartmentId };
};
