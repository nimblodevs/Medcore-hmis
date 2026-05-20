import prisma from "../config/prisma.js";
import ApiError from "../utils/apiError.js";

export const listTenants = async ({ tenantId, isSuperAdmin }) => {
  const where = {
    deletedAt: null,
    ...(isSuperAdmin ? {} : { id: tenantId })
  };
  return prisma.tenant.findMany({ where, orderBy: { createdAt: "desc" } });
};

export const createTenant = async (payload, actorId) => {
  const existing = await prisma.tenant.findUnique({ where: { code: payload.code } });
  if (existing) throw new ApiError(409, "Tenant code already exists");
  return prisma.tenant.create({
    data: {
      ...payload,
      createdById: actorId,
      updatedById: actorId
    }
  });
};

export const updateTenant = async (id, payload, actorId, context) => {
  const tenant = await prisma.tenant.findFirst({
    where: {
      id,
      deletedAt: null,
      ...(context.tenantId ? { id: context.tenantId } : {})
    }
  });
  if (!tenant) throw new ApiError(404, "Tenant not found");

  return prisma.tenant.update({
    where: { id },
    data: {
      ...payload,
      updatedById: actorId
    }
  });
};
