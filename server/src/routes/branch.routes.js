import { Router } from "express";
import * as branchController from "../controllers/branch.controller.js";
import requirePermission from "../middlewares/requirePermission.js";
import validateRequest from "../middlewares/validateRequest.js";
import { createBranchSchema, updateBranchSchema } from "../validators/tenant-branch.validator.js";
import { PERMISSIONS } from "../config/rbac.js";

const router = Router();

router.get("/", requirePermission(PERMISSIONS.MANAGE_BRANCHES), branchController.listBranches);
router.post("/", requirePermission(PERMISSIONS.MANAGE_BRANCHES), validateRequest(createBranchSchema), branchController.createBranch);
router.patch("/:id", requirePermission(PERMISSIONS.MANAGE_BRANCHES), validateRequest(updateBranchSchema), branchController.updateBranch);

export default router;

