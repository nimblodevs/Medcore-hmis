import { Router } from "express";
import * as tenantController from "../controllers/tenant.controller.js";
import requirePermission from "../middlewares/requirePermission.js";
import validateRequest from "../middlewares/validateRequest.js";
import { createTenantSchema, updateTenantSchema } from "../validators/tenant-branch.validator.js";
import { PERMISSIONS } from "../config/rbac.js";

const router = Router();

router.get("/", requirePermission(PERMISSIONS.MANAGE_TENANTS), tenantController.listTenants);
router.post("/", requirePermission(PERMISSIONS.MANAGE_TENANTS), validateRequest(createTenantSchema), tenantController.createTenant);
router.patch("/:id", requirePermission(PERMISSIONS.MANAGE_TENANTS), validateRequest(updateTenantSchema), tenantController.updateTenant);

export default router;
