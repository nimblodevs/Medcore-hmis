import { Router } from "express";
import * as roleController from "../controllers/role.controller.js";
import requirePermission from "../middlewares/requirePermission.js";
import validateRequest from "../middlewares/validateRequest.js";
import { createRoleSchema } from "../validators/role.validator.js";
import { PERMISSIONS } from "../config/rbac.js";

const router = Router();

router.get("/", requirePermission(PERMISSIONS.MANAGE_USERS), roleController.listRoles);
router.post("/", requirePermission(PERMISSIONS.MANAGE_USERS), validateRequest(createRoleSchema), roleController.createRole);

export default router;

