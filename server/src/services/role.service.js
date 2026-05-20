import prisma from "../config/prisma.js";
import ApiError from "../utils/apiError.js";

export const listRoles = async ({ tenantId, isSuperAdmin }) =>
  prisma.role.findMany({
    where: {
      deletedAt: null,
      OR: [{ tenantId: null }, ...(isSuperAdmin ? [] : [{ tenantId }])]
    },
    include: {
      rolePermissions: {
        where: { deletedAt: null },
        include: { permission: true }
      }
    },
    orderBy: { name: "asc" }
  });

export const createRole = async (payload, actor, context) => {
  const tenantId = context.tenantId || payload.tenantId || null;
  const existing = await prisma.role.findUnique({ where: { code: payload.code } });
  if (existing) throw new ApiError(409, "Role code already exists");

  return prisma.$transaction(async (tx) => {
    const role = await tx.role.create({
      data: {
        tenantId,
        name: payload.name,
        code: payload.code,
        description: payload.description,
        createdById: actor.userId,
        updatedById: actor.userId
      }
    });

    if (payload.permissionIds?.length) {
      await tx.rolePermission.createMany({
        data: payload.permissionIds.map((permissionId) => ({
          tenantId,
          roleId: role.id,
          permissionId,
          createdById: actor.userId,
          updatedById: actor.userId
        }))
      });
    }

    return role;
  });
};

