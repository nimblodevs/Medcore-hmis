import { Router } from "express";
import { appointmentService } from "../services/appointment.service.js";
import {
  createAppointmentSchema,
  updateAppointmentSchema,
  rescheduleAppointmentSchema,
  cancelAppointmentSchema,
  confirmAppointmentSchema,
  checkInAppointmentSchema,
  noShowAppointmentSchema,
  completeAppointmentSchema
} from "../validators/appointment.validators.js";

const router = Router();

// Middleware to extract user from request (assuming auth middleware sets req.user)
const getActorId = (req) => req.user?.id;

/**
 * GET /api/appointments
 * List appointments with filters
 */
router.get("/", async (req, res, next) => {
  try {
    const filters = {
      patientId: req.query.patientId,
      doctorId: req.query.doctorId,
      clinicId: req.query.clinicId,
      departmentId: req.query.departmentId,
      status: req.query.status,
      appointmentType: req.query.appointmentType,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 20
    };

    const result = await appointmentService.listAppointments(filters);

    res.json({
      success: true,
      data: result.data,
      pagination: result.pagination
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/appointments
 * Create a new appointment
 */
router.post("/", async (req, res, next) => {
  try {
    const validatedData = createAppointmentSchema.parse(req.body);
    const actorId = getActorId(req);

    const appointment = await appointmentService.createAppointment(
      validatedData,
      actorId,
      req
    );

    res.status(201).json({
      success: true,
      message: "Appointment booked successfully",
      data: appointment
    });
  } catch (error) {
    if (error.name === "ZodError") {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: error.errors
      });
    }
    next(error);
  }
});

/**
 * GET /api/appointments/:id
 * Get appointment details
 */
router.get("/:id", async (req, res, next) => {
  try {
    const appointment = await appointmentService.getAppointment(req.params.id);

    res.json({
      success: true,
      data: appointment
    });
  } catch (error) {
    if (error.message === "Appointment not found") {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    next(error);
  }
});

/**
 * PATCH /api/appointments/:id
 * Update appointment
 */
router.patch("/:id", async (req, res, next) => {
  try {
    const validatedData = updateAppointmentSchema.parse(req.body);
    const actorId = getActorId(req);

    const appointment = await appointmentService.updateAppointment(
      req.params.id,
      validatedData,
      actorId,
      req
    );

    res.json({
      success: true,
      message: "Appointment updated successfully",
      data: appointment
    });
  } catch (error) {
    if (error.name === "ZodError") {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: error.errors
      });
    }
    next(error);
  }
});

/**
 * POST /api/appointments/:id/confirm
 * Confirm an appointment
 */
router.post("/:id/confirm", async (req, res, next) => {
  try {
    const validatedData = confirmAppointmentSchema.parse(req.body);
    const actorId = getActorId(req);

    const appointment = await appointmentService.confirmAppointment(
      req.params.id,
      actorId,
      req,
      validatedData.notes
    );

    res.json({
      success: true,
      message: "Appointment confirmed successfully",
      data: appointment
    });
  } catch (error) {
    if (error.name === "ZodError") {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: error.errors
      });
    }
    next(error);
  }
});

/**
 * POST /api/appointments/:id/cancel
 * Cancel an appointment
 */
router.post("/:id/cancel", async (req, res, next) => {
  try {
    const validatedData = cancelAppointmentSchema.parse(req.body);
    const actorId = getActorId(req);

    const appointment = await appointmentService.cancelAppointment(
      req.params.id,
      actorId,
      validatedData.cancellationReason,
      req
    );

    res.json({
      success: true,
      message: "Appointment cancelled successfully",
      data: appointment
    });
  } catch (error) {
    if (error.name === "ZodError") {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: error.errors
      });
    }
    next(error);
  }
});

/**
 * GET /api/appointments/today/summary
 * Get today's appointment summary
 */
router.get("/today/summary", async (req, res, next) => {
  try {
    const summary = await appointmentService.getTodaySummary();

    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    next(error);
  }
});

export default router;
