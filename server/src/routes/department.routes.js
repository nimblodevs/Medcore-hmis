import { Router } from "express";
import * as departmentController from "../controllers/department.controller.js";
import requirePermission from "../middlewares/requirePermission.js";
import validateRequest from "../middlewares/validateRequest.js";
import { createDepartmentSchema, updateDepartmentSchema } from "../validators/department.validator.js";
import { PERMISSIONS } from "../config/rbac.js";

const router = Router();

router.get("/", requirePermission(PERMISSIONS.MANAGE_BRANCHES), departmentController.listDepartments);
router.post("/", requirePermission(PERMISSIONS.MANAGE_BRANCHES), validateRequest(createDepartmentSchema), departmentController.createDepartment);
router.patch("/:id", requirePermission(PERMISSIONS.MANAGE_BRANCHES), validateRequest(updateDepartmentSchema), departmentController.updateDepartment);

export default router;

