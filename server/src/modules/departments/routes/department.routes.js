import { Router } from "express";
import { departmentService } from "../services/department.service.js";
import { serviceUnitService } from "../services/service-unit.service.js";
import { departmentAssignmentService } from "../services/department-assignment.service.js";
import {
  createDepartmentSchema,
  updateDepartmentSchema,
  createServiceUnitSchema,
  updateServiceUnitSchema,
  assignUserToDepartmentSchema,
  assignManagerSchema,
  changeStatusSchema
} from "../validators/department.validator.js";
import requireRole from "../../../middlewares/requireRole.js";

const router = Router();

// Department Routes
router.get("/", requireRole(["SUPER_ADMIN", "ADMIN", "DEPARTMENT_MANAGER"]), async (req, res, next) => {
  try {
    const { status, departmentType, search, page, limit } = req.query;
    const result = await departmentService.listDepartments({
      status,
      departmentType,
      search,
      page: parseInt(page),
      limit: parseInt(limit)
    });
    res.json({ success: true, message: "Departments retrieved successfully", data: result.data, pagination: result.pagination });
  } catch (error) {
    next(error);
  }
});

router.post("/", requireRole(["SUPER_ADMIN", "ADMIN"]), async (req, res, next) => {
  try {
    const validatedData = createDepartmentSchema.parse(req.body);
    const actorId = req.user?.id;
    const department = await departmentService.createDepartment(validatedData, actorId);
    res.status(201).json({ success: true, message: "Department created successfully", data: department });
  } catch (error) {
    next(error);
  }
});

router.get("/dashboard-stats", requireRole(["SUPER_ADMIN", "ADMIN"]), async (req, res, next) => {
  try {
    const stats = await departmentService.getDashboardStats();
    res.json({ success: true, message: "Dashboard stats retrieved successfully", data: stats });
  } catch (error) {
    next(error);
  }
});

router.get("/:id", requireRole(["SUPER_ADMIN", "ADMIN", "DEPARTMENT_MANAGER"]), async (req, res, next) => {
  try {
    const department = await departmentService.getDepartment(req.params.id);
    res.json({ success: true, message: "Department retrieved successfully", data: department });
  } catch (error) {
    next(error);
  }
});

router.patch("/:id", requireRole(["SUPER_ADMIN", "ADMIN"]), async (req, res, next) => {
  try {
    const validatedData = updateDepartmentSchema.parse(req.body);
    const actorId = req.user?.id;
    const department = await departmentService.updateDepartment(req.params.id, validatedData, actorId);
    res.json({ success: true, message: "Department updated successfully", data: department });
  } catch (error) {
    next(error);
  }
});

router.post("/:id/activate", requireRole(["SUPER_ADMIN", "ADMIN"]), async (req, res, next) => {
  try {
    const validatedData = changeStatusSchema.parse(req.body);
    const actorId = req.user?.id;
    const department = await departmentService.activateDepartment(req.params.id, actorId, validatedData.reason);
    res.json({ success: true, message: "Department activated successfully", data: department });
  } catch (error) {
    next(error);
  }
});

router.post("/:id/deactivate", requireRole(["SUPER_ADMIN", "ADMIN"]), async (req, res, next) => {
  try {
    const validatedData = changeStatusSchema.parse(req.body);
    const actorId = req.user?.id;
    const department = await departmentService.deactivateDepartment(req.params.id, actorId, validatedData.reason);
    res.json({ success: true, message: "Department deactivated successfully", data: department });
  } catch (error) {
    next(error);
  }
});

router.post("/:id/archive", requireRole(["SUPER_ADMIN", "ADMIN"]), async (req, res, next) => {
  try {
    const validatedData = changeStatusSchema.parse(req.body);
    const actorId = req.user?.id;
    const department = await departmentService.archiveDepartment(req.params.id, actorId, validatedData.reason);
    res.json({ success: true, message: "Department archived successfully", data: department });
  } catch (error) {
    next(error);
  }
});

router.post("/:id/manager", requireRole(["SUPER_ADMIN", "ADMIN"]), async (req, res, next) => {
  try {
    const validatedData = assignManagerSchema.parse(req.body);
    const actorId = req.user?.id;
    const department = await departmentService.assignManager(req.params.id, validatedData.managerId, actorId);
    res.json({ success: true, message: "Manager assigned successfully", data: department });
  } catch (error) {
    next(error);
  }
});

// Service Unit Routes
router.get("/:departmentId/service-units", requireRole(["SUPER_ADMIN", "ADMIN", "DEPARTMENT_MANAGER"]), async (req, res, next) => {
  try {
    const { status, search, page, limit } = req.query;
    const result = await serviceUnitService.listServiceUnits(req.params.departmentId, {
      status,
      search,
      page: parseInt(page),
      limit: parseInt(limit)
    });
    res.json({ success: true, message: "Service units retrieved successfully", data: result.data, pagination: result.pagination });
  } catch (error) {
    next(error);
  }
});

router.post("/:departmentId/service-units", requireRole(["SUPER_ADMIN", "ADMIN"]), async (req, res, next) => {
  try {
    const validatedData = createServiceUnitSchema.parse(req.body);
    const actorId = req.user?.id;
    const serviceUnit = await serviceUnitService.createServiceUnit(req.params.departmentId, validatedData, actorId);
    res.status(201).json({ success: true, message: "Service unit created successfully", data: serviceUnit });
  } catch (error) {
    next(error);
  }
});

router.get("/service-units/:id", requireRole(["SUPER_ADMIN", "ADMIN", "DEPARTMENT_MANAGER"]), async (req, res, next) => {
  try {
    const serviceUnit = await serviceUnitService.getServiceUnit(req.params.id);
    res.json({ success: true, message: "Service unit retrieved successfully", data: serviceUnit });
  } catch (error) {
    next(error);
  }
});

router.patch("/service-units/:id", requireRole(["SUPER_ADMIN", "ADMIN"]), async (req, res, next) => {
  try {
    const validatedData = updateServiceUnitSchema.parse(req.body);
    const actorId = req.user?.id;
    const serviceUnit = await serviceUnitService.updateServiceUnit(req.params.id, validatedData, actorId);
    res.json({ success: true, message: "Service unit updated successfully", data: serviceUnit });
  } catch (error) {
    next(error);
  }
});

router.post("/service-units/:id/activate", requireRole(["SUPER_ADMIN", "ADMIN"]), async (req, res, next) => {
  try {
    const validatedData = changeStatusSchema.parse(req.body);
    const actorId = req.user?.id;
    const serviceUnit = await serviceUnitService.activateServiceUnit(req.params.id, actorId, validatedData.reason);
    res.json({ success: true, message: "Service unit activated successfully", data: serviceUnit });
  } catch (error) {
    next(error);
  }
});

router.post("/service-units/:id/deactivate", requireRole(["SUPER_ADMIN", "ADMIN"]), async (req, res, next) => {
  try {
    const validatedData = changeStatusSchema.parse(req.body);
    const actorId = req.user?.id;
    const serviceUnit = await serviceUnitService.deactivateServiceUnit(req.params.id, actorId, validatedData.reason);
    res.json({ success: true, message: "Service unit deactivated successfully", data: serviceUnit });
  } catch (error) {
    next(error);
  }
});

// User Assignment Routes
router.get("/:departmentId/users", requireRole(["SUPER_ADMIN", "ADMIN", "DEPARTMENT_MANAGER"]), async (req, res, next) => {
  try {
    const { isActive, serviceUnitId, page, limit } = req.query;
    const result = await departmentAssignmentService.getDepartmentUsers(req.params.departmentId, {
      isActive: isActive !== 'false',
      serviceUnitId,
      page: parseInt(page),
      limit: parseInt(limit)
    });
    res.json({ success: true, message: "Department users retrieved successfully", data: result.data, pagination: result.pagination });
  } catch (error) {
    next(error);
  }
});

router.post("/:departmentId/users", requireRole(["SUPER_ADMIN", "ADMIN"]), async (req, res, next) => {
  try {
    const validatedData = assignUserToDepartmentSchema.parse(req.body);
    const actorId = req.user?.id;
    const assignment = await departmentAssignmentService.assignUserToDepartment(
      req.params.departmentId,
      validatedData.userId,
      validatedData.serviceUnitId,
      validatedData.isPrimary,
      actorId
    );
    res.status(201).json({ success: true, message: "User assigned to department successfully", data: assignment });
  } catch (error) {
    next(error);
  }
});

router.post("/:departmentId/users/:userId/remove", requireRole(["SUPER_ADMIN", "ADMIN"]), async (req, res, next) => {
  try {
    const { serviceUnitId } = req.query;
    const actorId = req.user?.id;
    const result = await departmentAssignmentService.removeUserFromDepartment(
      req.params.departmentId,
      req.params.userId,
      serviceUnitId,
      actorId
    );
    res.json({ success: true, message: "User removed from department successfully", data: result });
  } catch (error) {
    next(error);
  }
});

export default router;
