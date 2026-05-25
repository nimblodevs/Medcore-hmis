import prisma from "../../../config/prisma.js";

export const appointmentAuditService = {
  async logAction({
    appointmentId,
    actorId,
    action,
    entityType,
    entityId,
    previousValues = null,
    newValues = null,
    reason = null,
    ipAddress = null,
    userAgent = null
  }) {
    const auditLog = await prisma.appointmentAuditLog.create({
      data: {
        appointmentId,
        actorId,
        action,
        entityType,
        entityId,
        previousValues,
        newValues,
        reason,
        ipAddress,
        userAgent
      }
    });

    return auditLog;
  },

  async getAppointmentHistory(appointmentId) {
    const logs = await prisma.appointmentAuditLog.findMany({
      where: { appointmentId },
      orderBy: { createdAt: 'asc' },
      include: {
        appointment: {
          select: {
            id: true,
            appointmentNumber: true,
            patientId: true
          }
        }
      }
    });

    return logs;
  }
};
