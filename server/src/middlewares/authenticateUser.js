import prisma from "../config/prisma.js";
import ApiError from "../utils/apiError.js";
import { verifyAccessToken } from "../utils/jwt.js";

const authenticateUser = async (req, _res, next) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!token) {
      throw new ApiError(401, "Authentication token is required");
    }

    const payload = verifyAccessToken(token);
    const user = await prisma.user.findFirst({
      where: { id: payload.userId, deletedAt: null, isActive: true },
      include: {
        roles: {
          where: { deletedAt: null },
          include: {
            role: {
              include: {
                rolePermissions: {
                  where: { deletedAt: null },
                  include: { permission: true }
                }
              }
            }
          }
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
      }
    });

    if (!user) {
      throw new ApiError(401, "User account not found or inactive");
    }

    const roleCodes = user.roles.map((entry) => entry.role.code);
    const permissions = new Set();
    user.roles.forEach((entry) =>
      entry.role.rolePermissions.forEach((rp) => permissions.add(rp.permission.code))
    );

    req.user = user;
    req.auth = {
      userId: user.id,
      tenantId: user.tenantId,
      branchId: payload.branchId || null,
      roles: roleCodes,
      isSuperAdmin: user.isSuperAdmin
    };
    req.auth.permissions = [...permissions];

    next();
  } catch (error) {
    next(error);
  }
};

export default authenticateUser;
