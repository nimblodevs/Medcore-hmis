import prisma from "../config/prisma.js";

const pad = (value, width = 4) => String(value).padStart(width, "0");

const getDateKey = () => new Date().toISOString().slice(0, 10).replace(/-/g, "");

const buildScopeKey = ({ tenantId, branchId }) => {
  const t = tenantId || "global";
  const b = branchId || "all";
  return `tenant:${t}|branch:${b}`;
};

const formatReference = ({ type, sequence, dateKey, prefix }) => {
  switch (type) {
    case "INVOICE":
      return `INV-${dateKey}-${pad(sequence)}`;
    case "BILL":
      return `${prefix || "BILL"}-${dateKey}-${pad(sequence)}`;
    case "DISPATCH_NOTE":
      return `DSP-${dateKey}-${pad(sequence)}`;
    case "CLAIM_REFERENCE":
      return `CLM-${dateKey}-${pad(sequence)}`;
    case "RECEIPT":
      return `RCP-${dateKey}-${pad(sequence)}`;
    default:
      return `${type}-${dateKey}-${pad(sequence)}`;
  }
};

export const getNextReference = async ({ type, tenantId, branchId, prefix }) => {
  const dateKey = getDateKey();
  const scopeKey = buildScopeKey({ tenantId, branchId });

  return prisma.$transaction(async (tx) => {
    await tx.referenceSequence.upsert({
      where: {
        scopeKey_type_dateKey: {
          scopeKey,
          type,
          dateKey
        }
      },
      update: {},
      create: {
        scopeKey,
        type,
        dateKey,
        lastNumber: 0
      }
    });

    const updated = await tx.referenceSequence.update({
      where: {
        scopeKey_type_dateKey: {
          scopeKey,
          type,
          dateKey
        }
      },
      data: {
        lastNumber: { increment: 1 }
      }
    });

    return {
      code: formatReference({
        type,
        sequence: updated.lastNumber,
        dateKey,
        prefix
      }),
      type,
      sequence: updated.lastNumber,
      dateKey,
      scopeKey
    };
  });
};

