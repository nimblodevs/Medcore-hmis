import prisma from "../config/prisma.js";
import ApiError from "../utils/apiError.js";

export const listDepartments = async ({ tenantId, branchId, isSuperAdmin }) => {
  return prisma.department.findMany({
    where: {
      deletedAt: null,
      ...(isSuperAdmin ? {} : { tenantId }),
      ...(branchId ? { OR: [{ branchId }, { branchId: null }] } : {})
    },
    orderBy: { name: "asc" }
  });
};

export const createDepartment = async (payload, actor, context) => {
  const tenantId = context.tenantId || payload.tenantId;
  if (!tenantId) throw new ApiError(400, "tenantId is required");

  const existing = await prisma.department.findFirst({
    where: { tenantId, code: payload.code, deletedAt: null }
  });
  if (existing) throw new ApiError(409, "Department code already exists in this tenant");

  return prisma.department.create({
    data: {
      tenantId,
      branchId: payload.branchId || null,
      name: payload.name,
      code: payload.code,
      description: payload.description || null,
      isClinical: Boolean(payload.isClinical),
      isActive: payload.isActive ?? true,
      createdById: actor.userId,
      updatedById: actor.userId
    }
  });
};

export const updateDepartment = async (id, payload, actor, context) => {
  const department = await prisma.department.findFirst({
    where: {
      id,
      deletedAt: null,
      ...(context.tenantId ? { tenantId: context.tenantId } : {})
    }
  });
  if (!department) throw new ApiError(404, "Department not found");

  return prisma.department.update({
    where: { id },
    data: {
      ...payload,
      updatedById: actor.userId
    }
  });
};

