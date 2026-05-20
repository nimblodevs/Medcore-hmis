import prisma from "../config/prisma.js";
import ApiError from "../utils/apiError.js";
import { comparePassword, hashPassword } from "../utils/password.js";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/jwt.js";

const getUserWithAccess = async (userId) =>
  prisma.user.findFirst({
    where: { id: userId, isActive: true, deletedAt: null },
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
      branches: { where: { deletedAt: null } },
      primaryDepartment: true,
      departments: {
        where: { deletedAt: null },
        include: { department: true }
      }
    }
  });

const buildTokenPayload = (user) => ({
  userId: user.id,
  tenantId: user.tenantId,
  roles: user.roles.map((entry) => entry.role.code),
  isSuperAdmin: user.isSuperAdmin
});

const buildAuthResponse = async (user) => {
  const payload = buildTokenPayload(user);
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);
  const refreshHash = await hashPassword(refreshToken);

  await prisma.user.update({
    where: { id: user.id },
    data: { refreshTokenHash: refreshHash }
  });

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      firstName: user.firstName,
      middleName: user.middleName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      staffId: user.staffId,
      jobTitle: user.jobTitle,
      tenantId: user.tenantId,
      isSuperAdmin: user.isSuperAdmin,
      roles: user.roles.map((entry) => entry.role.code),
      branches: user.branches.map((entry) => entry.branchId),
      primaryDepartmentId: user.primaryDepartmentId || null,
      departments: user.departments.map((entry) => entry.departmentId)
    }
  };
};

export const register = async (payload, actorId = null) => {
  const existing = await prisma.user.findUnique({ where: { email: payload.email } });
  if (existing) throw new ApiError(409, "Email already exists");

  const passwordHash = await hashPassword(payload.password);
  const user = await prisma.user.create({
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
      passwordHash,
      tenantId: payload.tenantId || null,
      isSuperAdmin: Boolean(payload.isSuperAdmin),
      createdById: actorId,
      updatedById: actorId
    }
  });

  const userWithAccess = await getUserWithAccess(user.id);
  return buildAuthResponse(userWithAccess);
};

export const login = async ({ email, password }) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || user.deletedAt || !user.isActive) {
    throw new ApiError(401, "Invalid credentials");
  }

  const passwordOk = await comparePassword(password, user.passwordHash);
  if (!passwordOk) throw new ApiError(401, "Invalid credentials");

  const userWithAccess = await getUserWithAccess(user.id);
  return buildAuthResponse(userWithAccess);
};

export const refreshAccess = async (refreshToken) => {
  const payload = verifyRefreshToken(refreshToken);
  const user = await prisma.user.findFirst({
    where: { id: payload.userId, deletedAt: null, isActive: true }
  });
  if (!user || !user.refreshTokenHash) throw new ApiError(401, "Invalid refresh token");

  const valid = await comparePassword(refreshToken, user.refreshTokenHash);
  if (!valid) throw new ApiError(401, "Invalid refresh token");

  const userWithAccess = await getUserWithAccess(user.id);
  return buildAuthResponse(userWithAccess);
};

export const logout = async (userId) => {
  await prisma.user.update({
    where: { id: userId },
    data: { refreshTokenHash: null }
  });
};

export const me = async (userId) => {
  const user = await getUserWithAccess(userId);
  if (!user) throw new ApiError(404, "User not found");
  return {
    id: user.id,
    firstName: user.firstName,
    middleName: user.middleName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    staffId: user.staffId,
    jobTitle: user.jobTitle,
    tenantId: user.tenantId,
    isSuperAdmin: user.isSuperAdmin,
    roles: user.roles.map((entry) => entry.role.code),
    branches: user.branches.map((entry) => entry.branchId),
    primaryDepartmentId: user.primaryDepartmentId || null,
    departments: user.departments.map((entry) => entry.departmentId)
  };
};
