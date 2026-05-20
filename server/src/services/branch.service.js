import prisma from "../config/prisma.js";
import ApiError from "../utils/apiError.js";

export const listBranches = async ({ tenantId, isSuperAdmin, branchId }) => {
  const where = {
    deletedAt: null,
    ...(isSuperAdmin ? {} : { tenantId }),
    ...(branchId ? { id: branchId } : {})
  };
  return prisma.branch.findMany({ where, orderBy: { createdAt: "desc" } });
};

export const createBranch = async (payload, actorId, context) => {
  const tenantId = context.tenantId || payload.tenantId;
  if (!tenantId) throw new ApiError(400, "tenantId is required");

  const existing = await prisma.branch.findFirst({
    where: { tenantId, code: payload.code, deletedAt: null }
  });
  if (existing) throw new ApiError(409, "Branch code already exists in this tenant");

  return prisma.branch.create({
    data: {
      tenantId,
      ...payload,
      createdById: actorId,
      updatedById: actorId
    }
  });
};

export const updateBranch = async (id, payload, actorId, context) => {
  const branch = await prisma.branch.findFirst({
    where: {
      id,
      deletedAt: null,
      ...(context.tenantId ? { tenantId: context.tenantId } : {})
    }
  });
  if (!branch) throw new ApiError(404, "Branch not found");

  return prisma.branch.update({
    where: { id },
    data: {
      ...payload,
      updatedById: actorId
    }
  });
};
