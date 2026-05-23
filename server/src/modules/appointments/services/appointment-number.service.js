import prisma from "../../prisma.js";

let appointmentNumberCache = {
  year: new Date().getFullYear(),
  sequence: 0
};

export const appointmentNumberService = {
  async generateAppointmentNumber() {
    const currentYear = new Date().getFullYear();
    
    // Reset sequence if year changed
    if (currentYear !== appointmentNumberCache.year) {
      appointmentNumberCache.year = currentYear;
      appointmentNumberCache.sequence = 0;
    }

    // Use a transaction to ensure unique number generation
    const appointment = await prisma.$transaction(async (tx) => {
      appointmentNumberCache.sequence++;
      
      const paddedSequence = String(appointmentNumberCache.sequence).padStart(6, '0');
      const appointmentNumber = `APT-${currentYear}-${paddedSequence}`;

      // Check if this number already exists (safety check)
      const existing = await tx.appointment.findUnique({
        where: { appointmentNumber }
      });

      if (existing) {
        // If collision, increment and try again recursively
        return this.generateAppointmentNumber();
      }

      return { appointmentNumber };
    });

    return appointment.appointmentNumber;
  },

  async resetSequence(year) {
    appointmentNumberCache.year = year;
    appointmentNumberCache.sequence = 0;
  }
};
