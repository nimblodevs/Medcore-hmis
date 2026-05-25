import prisma from "../../../config/prisma.js";
import { appointmentNumberService } from "./appointment-number.service.js";
import { appointmentAuditService } from "./appointment-audit.service.js";

export const appointmentService = {
  /**
   * Create a new appointment
   */
  async createAppointment(data, actorId, req) {
    const {
      patientId,
      departmentId,
      clinicId,
      serviceUnitId,
      doctorId,
      appointmentType,
      priority,
      source,
      scheduledStartAt,
      scheduledEndAt,
      reason,
      notes
    } = data;

    // Validate end time is after start time
    if (scheduledEndAt <= scheduledStartAt) {
      throw new Error("Appointment end time must be after start time");
    }

    // Check for past appointments
    if (scheduledStartAt < new Date()) {
      throw new Error("Cannot book appointments in the past");
    }

    // Check for doctor double booking
    if (doctorId) {
      const hasOverlap = await this.checkDoctorOverlap(
        doctorId,
        scheduledStartAt,
        scheduledEndAt
      );
      if (hasOverlap) {
        throw new Error("Doctor already has an appointment during this time");
      }
    }

    // Check for patient double booking
    const patientOverlap = await this.checkPatientOverlap(
      patientId,
      scheduledStartAt,
      scheduledEndAt
    );
    if (patientOverlap) {
      throw new Error("Patient already has an appointment during this time");
    }

    // Check slot capacity if applicable
    if (clinicId || doctorId) {
      await this.checkSlotAvailability({
        clinicId,
        doctorId,
        scheduledStartAt,
        scheduledEndAt
      });
    }

    // Generate appointment number
    const appointmentNumber = await appointmentNumberService.generateAppointmentNumber();

    // Create appointment with audit log in transaction
    const appointment = await prisma.$transaction(async (tx) => {
      const apt = await tx.appointment.create({
        data: {
          appointmentNumber,
          patientId,
          departmentId,
          clinicId,
          serviceUnitId,
          doctorId,
          appointmentType,
          priority,
          source,
          status: "BOOKED",
          scheduledStartAt,
          scheduledEndAt,
          reason,
          notes,
          createdById: actorId
        },
        include: {
          patient: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              hospitalNumber: true
            }
          }
        }
      });

      // Log audit
      await tx.appointmentAuditLog.create({
        data: {
          appointmentId: apt.id,
          actorId,
          action: "APPOINTMENT_CREATED",
          entityType: "Appointment",
          entityId: apt.id,
          newValues: {
            appointmentNumber,
            patientId,
            scheduledStartAt,
            scheduledEndAt,
            appointmentType,
            status: "BOOKED"
          },
          ipAddress: req?.ip,
          userAgent: req?.get("user-agent")
        }
      });

      return apt;
    });

    return appointment;
  },

  /**
   * Get appointment by ID
   */
  async getAppointment(id) {
    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            hospitalNumber: true,
            phone: true,
            dateOfBirth: true,
            gender: true
          }
        },
        auditLogs: {
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    });

    if (!appointment) {
      throw new Error("Appointment not found");
    }

    return appointment;
  },

  /**
   * List appointments with filters
   */
  async listAppointments(filters = {}) {
    const {
      patientId,
      doctorId,
      clinicId,
      departmentId,
      status,
      appointmentType,
      startDate,
      endDate,
      page = 1,
      limit = 20
    } = filters;

    const where = {};

    if (patientId) where.patientId = patientId;
    if (doctorId) where.doctorId = doctorId;
    if (clinicId) where.clinicId = clinicId;
    if (departmentId) where.departmentId = departmentId;
    if (status) where.status = status;
    if (appointmentType) where.appointmentType = appointmentType;

    if (startDate || endDate) {
      where.scheduledStartAt = {};
      if (startDate) where.scheduledStartAt.gte = new Date(startDate);
      if (endDate) where.scheduledStartAt.lte = new Date(endDate);
    }

    const [appointments, total] = await Promise.all([
      prisma.appointment.findMany({
        where,
        include: {
          patient: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              hospitalNumber: true
            }
          }
        },
        orderBy: { scheduledStartAt: 'asc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.appointment.count({ where })
    ]);

    return {
      data: appointments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  },

  /**
   * Update appointment
   */
  async updateAppointment(id, data, actorId, req) {
    const existing = await this.getAppointment(id);

    // Don't allow updates to completed, cancelled, or no-show appointments
    if (["COMPLETED", "CANCELLED", "NO_SHOW"].includes(existing.status)) {
      throw new Error(`Cannot update ${existing.status} appointment`);
    }

    const previousValues = {
      departmentId: existing.departmentId,
      clinicId: existing.clinicId,
      serviceUnitId: existing.serviceUnitId,
      doctorId: existing.doctorId,
      appointmentType: existing.appointmentType,
      priority: existing.priority,
      reason: existing.reason,
      notes: existing.notes
    };

    const appointment = await prisma.$transaction(async (tx) => {
      const updated = await tx.appointment.update({
        where: { id },
        data: {
          ...data,
          updatedById: actorId
        },
        include: {
          patient: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              hospitalNumber: true
            }
          }
        }
      });

      await tx.appointmentAuditLog.create({
        data: {
          appointmentId: id,
          actorId,
          action: "APPOINTMENT_UPDATED",
          entityType: "Appointment",
          entityId: id,
          previousValues,
          newValues: data,
          ipAddress: req?.ip,
          userAgent: req?.get("user-agent")
        }
      });

      return updated;
    });

    return appointment;
  },

  /**
   * Confirm appointment
   */
  async confirmAppointment(id, actorId, req, notes = null) {
    const appointment = await this.getAppointment(id);

    if (appointment.status !== "BOOKED") {
      throw new Error(`Only BOOKED appointments can be confirmed. Current status: ${appointment.status}`);
    }

    const updated = await prisma.$transaction(async (tx) => {
      const apt = await tx.appointment.update({
        where: { id },
        data: {
          status: "CONFIRMED",
          confirmedAt: new Date(),
          confirmedById: actorId,
          notes: notes || appointment.notes
        },
        include: {
          patient: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              hospitalNumber: true
            }
          }
        }
      });

      await tx.appointmentAuditLog.create({
        data: {
          appointmentId: id,
          actorId,
          action: "APPOINTMENT_CONFIRMED",
          entityType: "Appointment",
          entityId: id,
          previousValues: { status: "BOOKED" },
          newValues: { status: "CONFIRMED" },
          ipAddress: req?.ip,
          userAgent: req?.get("user-agent")
        }
      });

      return apt;
    });

    return updated;
  },

  /**
   * Cancel appointment
   */
  async cancelAppointment(id, actorId, cancellationReason, req) {
    const appointment = await this.getAppointment(id);

    if (["COMPLETED", "CANCELLED"].includes(appointment.status)) {
      throw new Error(`Cannot cancel ${appointment.status} appointment`);
    }

    const updated = await prisma.$transaction(async (tx) => {
      const apt = await tx.appointment.update({
        where: { id },
        data: {
          status: "CANCELLED",
          cancelledAt: new Date(),
          cancelledById: actorId,
          cancellationReason
        },
        include: {
          patient: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              hospitalNumber: true
            }
          }
        }
      });

      await tx.appointmentAuditLog.create({
        data: {
          appointmentId: id,
          actorId,
          action: "APPOINTMENT_CANCELLED",
          entityType: "Appointment",
          entityId: id,
          previousValues: { status: appointment.status },
          newValues: { status: "CANCELLED", cancellationReason },
          ipAddress: req?.ip,
          userAgent: req?.get("user-agent")
        }
      });

      return apt;
    });

    return updated;
  },

  async rescheduleAppointment(id, data, actorId, req) {
    const appointment = await this.getAppointment(id);

    if (["COMPLETED", "CANCELLED", "NO_SHOW"].includes(appointment.status)) {
      throw new Error(`Cannot reschedule ${appointment.status} appointment`);
    }

    if (data.scheduledEndAt <= data.scheduledStartAt) {
      throw new Error("Appointment end time must be after start time");
    }

    if (appointment.doctorId) {
      const hasDoctorOverlap = await this.checkDoctorOverlap(
        appointment.doctorId,
        data.scheduledStartAt,
        data.scheduledEndAt,
        id
      );
      if (hasDoctorOverlap) throw new Error("Doctor already has an appointment during this time");
    }

    const hasPatientOverlap = await this.checkPatientOverlap(
      appointment.patientId,
      data.scheduledStartAt,
      data.scheduledEndAt,
      id
    );
    if (hasPatientOverlap) throw new Error("Patient already has an appointment during this time");

    const updated = await prisma.appointment.update({
      where: { id },
      data: {
        scheduledStartAt: data.scheduledStartAt,
        scheduledEndAt: data.scheduledEndAt,
        status: "RESCHEDULED",
        rescheduledAt: new Date(),
        rescheduledById: actorId,
        rescheduleReason: data.rescheduleReason,
        updatedById: actorId
      },
      include: {
        patient: {
          select: { id: true, firstName: true, lastName: true, hospitalNumber: true }
        }
      }
    });

    await appointmentAuditService.logAction({
      appointmentId: id,
      actorId,
      action: "APPOINTMENT_RESCHEDULED",
      entityType: "Appointment",
      entityId: id,
      previousValues: {
        scheduledStartAt: appointment.scheduledStartAt,
        scheduledEndAt: appointment.scheduledEndAt
      },
      newValues: data,
      reason: data.rescheduleReason,
      ipAddress: req?.ip,
      userAgent: req?.get("user-agent")
    });

    return updated;
  },

  async checkInAppointment(id, actorId, req, notes = null) {
    const appointment = await this.getAppointment(id);
    if (!["BOOKED", "CONFIRMED"].includes(appointment.status)) {
      throw new Error(`Cannot check in ${appointment.status} appointment`);
    }

    return prisma.appointment.update({
      where: { id },
      data: {
        status: "CHECKED_IN",
        checkedInAt: new Date(),
        checkedInById: actorId,
        notes: notes || appointment.notes
      },
      include: { patient: { select: { id: true, firstName: true, lastName: true, hospitalNumber: true } } }
    });
  },

  async markNoShow(id, actorId, req, reason = null) {
    const appointment = await this.getAppointment(id);
    if (["COMPLETED", "CANCELLED"].includes(appointment.status)) {
      throw new Error(`Cannot mark ${appointment.status} appointment as no-show`);
    }

    return prisma.appointment.update({
      where: { id },
      data: {
        status: "NO_SHOW",
        noShowAt: new Date(),
        noShowById: actorId,
        notes: reason || appointment.notes
      },
      include: { patient: { select: { id: true, firstName: true, lastName: true, hospitalNumber: true } } }
    });
  },

  async completeAppointment(id, actorId, req, notes = null) {
    const appointment = await this.getAppointment(id);
    if (!["CHECKED_IN", "CONFIRMED"].includes(appointment.status)) {
      throw new Error(`Cannot complete ${appointment.status} appointment`);
    }

    return prisma.appointment.update({
      where: { id },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
        completedById: actorId,
        notes: notes || appointment.notes
      },
      include: { patient: { select: { id: true, firstName: true, lastName: true, hospitalNumber: true } } }
    });
  },

  /**
   * Check for doctor appointment overlaps
   */
  async checkDoctorOverlap(doctorId, startAt, endAt, excludeAppointmentId = null) {
    const where = {
      doctorId,
      status: {
        notIn: ["CANCELLED", "RESCHEDULED"]
      },
      scheduledStartAt: {
        lt: endAt
      },
      scheduledEndAt: {
        gt: startAt
      }
    };

    if (excludeAppointmentId) {
      where.id = { not: excludeAppointmentId };
    }

    const count = await prisma.appointment.count({ where });
    return count > 0;
  },

  /**
   * Check for patient appointment overlaps
   */
  async checkPatientOverlap(patientId, startAt, endAt, excludeAppointmentId = null) {
    const where = {
      patientId,
      status: {
        notIn: ["CANCELLED", "RESCHEDULED"]
      },
      scheduledStartAt: {
        lt: endAt
      },
      scheduledEndAt: {
        gt: startAt
      }
    };

    if (excludeAppointmentId) {
      where.id = { not: excludeAppointmentId };
    }

    const count = await prisma.appointment.count({ where });
    return count > 0;
  },

  /**
   * Check slot availability
   */
  async checkSlotAvailability({ clinicId, doctorId, scheduledStartAt, scheduledEndAt }) {
    // Find overlapping slots
    const slots = await prisma.appointmentSlot.findMany({
      where: {
        AND: [
          {
            OR: [
              { clinicId },
              { doctorId }
            ]
          },
          {
            startAt: { lte: scheduledEndAt }
          },
          {
            endAt: { gte: scheduledStartAt }
          },
          { isBlocked: false }
        ]
      }
    });

    if (slots.length === 0) {
      // No slots defined, allow booking (open scheduling)
      return true;
    }

    // Check if any slot has capacity
    const hasCapacity = slots.some(slot => slot.bookedCount < slot.capacity);
    
    if (!hasCapacity) {
      throw new Error("No available slots for this time period");
    }

    return true;
  },

  /**
   * Get today's appointments summary
   */
  async getTodaySummary() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      total,
      booked,
      confirmed,
      checkedIn,
      completed,
      cancelled,
      noShow
    ] = await Promise.all([
      prisma.appointment.count({
        where: {
          scheduledStartAt: {
            gte: today,
            lt: tomorrow
          }
        }
      }),
      prisma.appointment.count({
        where: {
          scheduledStartAt: { gte: today, lt: tomorrow },
          status: "BOOKED"
        }
      }),
      prisma.appointment.count({
        where: {
          scheduledStartAt: { gte: today, lt: tomorrow },
          status: "CONFIRMED"
        }
      }),
      prisma.appointment.count({
        where: {
          scheduledStartAt: { gte: today, lt: tomorrow },
          status: "CHECKED_IN"
        }
      }),
      prisma.appointment.count({
        where: {
          scheduledStartAt: { gte: today, lt: tomorrow },
          status: "COMPLETED"
        }
      }),
      prisma.appointment.count({
        where: {
          scheduledStartAt: { gte: today, lt: tomorrow },
          status: "CANCELLED"
        }
      }),
      prisma.appointment.count({
        where: {
          scheduledStartAt: { gte: today, lt: tomorrow },
          status: "NO_SHOW"
        }
      })
    ]);

    return {
      date: today,
      total,
      byStatus: {
        booked,
        confirmed,
        checkedIn,
        completed,
        cancelled,
        noShow
      }
    };
  }
};
