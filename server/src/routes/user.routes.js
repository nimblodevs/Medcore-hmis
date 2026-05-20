import { Router } from "express";
import * as userController from "../controllers/user.controller.js";
import requirePermission from "../middlewares/requirePermission.js";
import validateRequest from "../middlewares/validateRequest.js";
import {
  assignBranchesSchema,
  assignDepartmentsSchema,
  assignRolesSchema,
  createUserSchema,
  updateUserSchema
} from "../validators/user.validator.js";
import { PERMISSIONS } from "../config/rbac.js";

const router = Router();

router.get("/", requirePermission(PERMISSIONS.MANAGE_USERS), userController.listUsers);
router.post("/", requirePermission(PERMISSIONS.MANAGE_USERS), validateRequest(createUserSchema), userController.createUser);
router.patch("/:id", requirePermission(PERMISSIONS.MANAGE_USERS), validateRequest(updateUserSchema), userController.updateUser);
router.post("/:id/roles", requirePermission(PERMISSIONS.MANAGE_USERS), validateRequest(assignRolesSchema), userController.assignUserRoles);
router.post("/:id/branches", requirePermission(PERMISSIONS.MANAGE_USERS), validateRequest(assignBranchesSchema), userController.assignUserBranches);
router.post("/:id/departments", requirePermission(PERMISSIONS.MANAGE_USERS), validateRequest(assignDepartmentsSchema), userController.assignUserDepartments);

export default router;
