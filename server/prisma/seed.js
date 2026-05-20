import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { DEFAULT_ROLE_PERMISSIONS, PERMISSIONS, ROLES } from "../src/config/rbac.js";

const prisma = new PrismaClient();

const SYSTEM_PERMISSION_LABELS = {
  [PERMISSIONS.VIEW_INVOICES]: "View invoices",
  [PERMISSIONS.CREATE_INVOICES]: "Create invoices",
  [PERMISSIONS.EDIT_DRAFT_INVOICES]: "Edit draft invoices",
  [PERMISSIONS.APPROVE_INVOICES]: "Approve invoices",
  [PERMISSIONS.SUBMIT_TO_PAYER]: "Submit invoices to payer",
  [PERMISSIONS.GENERATE_CLAIMS]: "Generate claims",
  [PERMISSIONS.RECEIVE_PAYMENTS]: "Receive payments",
  [PERMISSIONS.REVERSE_INVOICES]: "Reverse invoices",
  [PERMISSIONS.VIEW_REPORTS]: "View reports",
  [PERMISSIONS.MANAGE_USERS]: "Manage users",
  [PERMISSIONS.MANAGE_BRANCHES]: "Manage branches",
  [PERMISSIONS.MANAGE_TENANTS]: "Manage tenants"
};

const ROLE_LABELS = {
  [ROLES.SUPER_ADMIN]: "Super Admin",
  [ROLES.HOSPITAL_ADMIN]: "Hospital Admin",
  [ROLES.BRANCH_ADMIN]: "Branch Admin",
  [ROLES.BILLING_OFFICER]: "Billing Officer",
  [ROLES.CREDIT_CONTROLLER]: "Credit Controller",
  [ROLES.ACCOUNTANT]: "Accountant",
  [ROLES.CLAIMS_OFFICER]: "Claims Officer",
  [ROLES.DOCTOR]: "Doctor",
  [ROLES.RECEPTIONIST]: "Receptionist",
  [ROLES.AUDITOR]: "Auditor"
};

async function seedPermissions() {
  for (const code of Object.values(PERMISSIONS)) {
    await prisma.permission.upsert({
      where: { code },
      update: { name: SYSTEM_PERMISSION_LABELS[code], description: SYSTEM_PERMISSION_LABELS[code] },
      create: {
        code,
        name: SYSTEM_PERMISSION_LABELS[code],
        description: SYSTEM_PERMISSION_LABELS[code]
      }
    });
  }
}

async function seedRoles() {
  const permissions = await prisma.permission.findMany({
    where: { code: { in: Object.values(PERMISSIONS) } }
  });
  const permissionsByCode = new Map(permissions.map((p) => [p.code, p]));

  for (const roleCode of Object.values(ROLES)) {
    const role = await prisma.role.upsert({
      where: { code: roleCode },
      update: { name: ROLE_LABELS[roleCode], isSystem: true },
      create: {
        code: roleCode,
        name: ROLE_LABELS[roleCode],
        isSystem: true
      }
    });

    await prisma.rolePermission.deleteMany({ where: { roleId: role.id } });
    const rolePermissions = DEFAULT_ROLE_PERMISSIONS[roleCode] || [];
    for (const permissionCode of rolePermissions) {
      const permission = permissionsByCode.get(permissionCode);
      if (!permission) continue;
      await prisma.rolePermission.create({
        data: {
          roleId: role.id,
          permissionId: permission.id
        }
      });
    }
  }
}

async function seedSuperAdmin() {
  const email = process.env.SEED_SUPER_ADMIN_EMAIL || "admin@medcore.local";
  const password = process.env.SEED_SUPER_ADMIN_PASSWORD || "Admin@123";

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return existing;

  const passwordHash = await bcrypt.hash(password, Number(process.env.BCRYPT_SALT_ROUNDS || 12));
  const user = await prisma.user.create({
    data: {
      firstName: "System",
      lastName: "Administrator",
      email,
      passwordHash,
      isSuperAdmin: true
    }
  });

  return user;
}

async function main() {
  await seedPermissions();
  await seedRoles();
  await seedSuperAdmin();
  console.log("Seed completed successfully.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
