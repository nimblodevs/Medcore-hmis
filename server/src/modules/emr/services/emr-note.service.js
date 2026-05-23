import prisma from "../../config/database.js";
import { ClinicalRecordStatus } from "@prisma/client";
import { 
  recordNoteCreated, 
  recordNoteSigned, 
  recordNoteAmended, 
  recordNoteVoided 
} from "./emr-audit.service.js";

/**
 * Create a clinical note for an encounter
 */
export async function createClinicalNote(encounterId, data, user, ipAddress, userAgent) {
  const { subjective, objective, assessment, plan, noteText } = data;

  // Verify encounter exists and is open/in-progress
  const encounter = await prisma.emrEncounter.findUnique({
    where: { id: encounterId },
    include: { patient: true }
  });

  if (!encounter) {
    throw new Error("Encounter not found");
  }

  if (encounter.status === 'CLOSED' || encounter.status === 'CANCELLED') {
    throw new Error("Cannot create note for closed or cancelled encounter");
  }

  // Create clinical note in DRAFT status
  const note = await prisma.emrClinicalNote.create({
    data: {
      encounterId,
      subjective,
      objective,
      assessment,
      plan,
      noteText,
      status: ClinicalRecordStatus.DRAFT,
      createdById: user?.id
    },
    include: {
      encounter: {
        include: {
          patient: true
        }
      },
      createdBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true
        }
      }
    }
  });

  // Audit log
  await recordNoteCreated(
    encounterId,
    encounter.patientId,
    user?.id,
    "EmrClinicalNote",
    note.id,
    null,
    { subjective, objective, assessment, plan, noteText },
    ipAddress,
    userAgent
  );

  return note;
}

/**
 * Get clinical notes for an encounter
 */
export async function getClinicalNotes(encounterId) {
  const notes = await prisma.emrClinicalNote.findMany({
    where: { encounterId },
    orderBy: { createdAt: 'desc' },
    include: {
      createdBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true
        }
      },
      signedBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true
        }
      },
      amendedFrom: {
        select: {
          id: true,
          status: true,
          signedAt: true
        }
      }
    }
  });

  return notes;
}

/**
 * Get a specific clinical note
 */
export async function getClinicalNote(noteId) {
  const note = await prisma.emrClinicalNote.findUnique({
    where: { id: noteId },
    include: {
      encounter: {
        include: {
          patient: true
        }
      },
      createdBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true
        }
      },
      signedBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true
        }
      },
      amendedFrom: {
        select: {
          id: true,
          status: true,
          signedAt: true
        }
      }
    }
  });

  if (!note) {
    throw new Error("Clinical note not found");
  }

  return note;
}

/**
 * Update a draft clinical note
 */
export async function updateClinicalNote(noteId, data, user, ipAddress, userAgent) {
  const note = await prisma.emrClinicalNote.findUnique({
    where: { id: noteId },
    include: {
      encounter: {
        include: {
          patient: true
        }
      }
    }
  });

  if (!note) {
    throw new Error("Clinical note not found");
  }

  if (note.status !== ClinicalRecordStatus.DRAFT) {
    throw new Error("Only draft notes can be updated. Signed notes require amendment.");
  }

  if (note.createdById !== user?.id) {
    throw new Error("Only the creator can update a draft note");
  }

  const previousValues = {
    subjective: note.subjective,
    objective: note.objective,
    assessment: note.assessment,
    plan: note.plan,
    noteText: note.noteText
  };

  // Update note
  const updatedNote = await prisma.emrClinicalNote.update({
    where: { id: noteId },
    data: {
      ...data,
      updatedById: user?.id
    }
  });

  // Audit log
  await recordNoteCreated(
    note.encounterId,
    note.patientId,
    user?.id,
    "EmrClinicalNote",
    noteId,
    previousValues,
    data,
    ipAddress,
    userAgent
  );

  return updatedNote;
}

/**
 * Sign a clinical note
 */
export async function signClinicalNote(noteId, user, ipAddress, userAgent) {
  const note = await prisma.emrClinicalNote.findUnique({
    where: { id: noteId },
    include: {
      encounter: {
        include: {
          patient: true
        }
      }
    }
  });

  if (!note) {
    throw new Error("Clinical note not found");
  }

  if (note.status === ClinicalRecordStatus.SIGNED) {
    throw new Error("Note is already signed");
  }

  if (note.status === ClinicalRecordStatus.VOIDED) {
    throw new Error("Cannot sign a voided note");
  }

  const previousValues = { status: note.status };

  // Sign the note
  const signedNote = await prisma.emrClinicalNote.update({
    where: { id: noteId },
    data: {
      status: ClinicalRecordStatus.SIGNED,
      signedById: user?.id,
      signedAt: new Date(),
      updatedById: user?.id
    }
  });

  // Audit log
  await recordNoteSigned(
    note.encounterId,
    note.patientId,
    user?.id,
    "EmrClinicalNote",
    noteId,
    previousValues,
    { status: ClinicalRecordStatus.SIGNED, signedById: user?.id },
    ipAddress,
    userAgent
  );

  return signedNote;
}

/**
 * Amend a signed clinical note
 */
export async function amendClinicalNote(noteId, data, user, ipAddress, userAgent) {
  const { amendmentReason, newContent } = data;

  const originalNote = await prisma.emrClinicalNote.findUnique({
    where: { id: noteId },
    include: {
      encounter: {
        include: {
          patient: true
        }
      }
    }
  });

  if (!originalNote) {
    throw new Error("Clinical note not found");
  }

  if (originalNote.status !== ClinicalRecordStatus.SIGNED) {
    throw new Error("Only signed notes can be amended");
  }

  // Create amended note
  const amendedNote = await prisma.emrClinicalNote.create({
    data: {
      encounterId: originalNote.encounterId,
      subjective: newContent?.subjective ?? originalNote.subjective,
      objective: newContent?.objective ?? originalNote.objective,
      assessment: newContent?.assessment ?? originalNote.assessment,
      plan: newContent?.plan ?? originalNote.plan,
      noteText: newContent?.noteText ?? originalNote.noteText,
      status: ClinicalRecordStatus.AMENDED,
      amendedFromId: noteId,
      amendmentReason,
      createdById: user?.id
    }
  });

  // Audit log
  await recordNoteAmended(
    originalNote.encounterId,
    originalNote.patientId,
    user?.id,
    "EmrClinicalNote",
    noteId,
    { status: ClinicalRecordStatus.SIGNED },
    { 
      amendedNoteId: amendedNote.id,
      amendmentReason,
      newContent 
    },
    ipAddress,
    userAgent
  );

  return amendedNote;
}

/**
 * Void a clinical note
 */
export async function voidClinicalNote(noteId, reason, user, ipAddress, userAgent) {
  const note = await prisma.emrClinicalNote.findUnique({
    where: { id: noteId },
    include: {
      encounter: {
        include: {
          patient: true
        }
      }
    }
  });

  if (!note) {
    throw new Error("Clinical note not found");
  }

  if (note.status === ClinicalRecordStatus.VOIDED) {
    throw new Error("Note is already voided");
  }

  const previousValues = { status: note.status };

  // Void the note
  const voidedNote = await prisma.emrClinicalNote.update({
    where: { id: noteId },
    data: {
      status: ClinicalRecordStatus.VOIDED,
      updatedById: user?.id
    }
  });

  // Audit log
  await recordNoteVoided(
    note.encounterId,
    note.patientId,
    user?.id,
    "EmrClinicalNote",
    noteId,
    previousValues,
    { status: ClinicalRecordStatus.VOIDED, reason },
    ipAddress,
    userAgent
  );

  return voidedNote;
}
