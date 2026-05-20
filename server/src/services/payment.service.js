import { InvoiceStatus } from "@prisma/client";
import prisma from "../config/prisma.js";
import ApiError from "../utils/apiError.js";
import { round2, toNumber } from "../utils/money.js";

const ALLOCATABLE_STATUSES = [
  InvoiceStatus.APPROVED,
  InvoiceStatus.SUBMITTED_TO_PAYER,
  InvoiceStatus.PARTIALLY_PAID
];

export const createPayment = async (payload, actor, context) => {
  const tenantId = context.tenantId || payload.tenantId;
  const branchId = context.branchId || payload.branchId;
  if (!tenantId) throw new ApiError(400, "tenantId is required");
  if (!branchId) throw new ApiError(400, "branchId is required");

  return prisma.payment.create({
    data: {
      tenantId,
      branchId,
      patientId: payload.patientId || null,
      paymentDate: payload.paymentDate,
      paymentMethod: payload.paymentMethod,
      referenceNo: payload.referenceNo || null,
      amountReceived: round2(payload.amountReceived),
      unappliedAmount: round2(payload.amountReceived),
      notes: payload.notes || null,
      createdById: actor.userId,
      updatedById: actor.userId
    }
  });
};

export const allocatePayment = async (paymentId, payload, actor, context) =>
  prisma.$transaction(async (tx) => {
    const payment = await tx.payment.findFirst({
      where: { id: paymentId, deletedAt: null, ...(context.tenantId ? { tenantId: context.tenantId } : {}) }
    });
    if (!payment) throw new ApiError(404, "Payment not found");

    const invoice = await tx.invoice.findFirst({
      where: { id: payload.invoiceId, deletedAt: null, ...(context.tenantId ? { tenantId: context.tenantId } : {}) }
    });
    if (!invoice) throw new ApiError(404, "Invoice not found");
    if (!ALLOCATABLE_STATUSES.includes(invoice.status)) {
      throw new ApiError(400, "Payments can be allocated only to approved or submitted invoices");
    }

    const allocatedAmount = round2(payload.allocatedAmount);
    if (allocatedAmount > toNumber(payment.unappliedAmount)) {
      throw new ApiError(400, "Allocated amount exceeds available unapplied payment");
    }
    if (allocatedAmount > toNumber(invoice.outstandingAmount)) {
      throw new ApiError(400, "Allocated amount exceeds invoice outstanding balance");
    }

    const allocation = await tx.paymentAllocation.create({
      data: {
        tenantId: invoice.tenantId,
        branchId: invoice.branchId,
        paymentId: payment.id,
        invoiceId: invoice.id,
        allocatedAmount,
        createdById: actor.userId,
        updatedById: actor.userId
      }
    });

    const newAmountPaid = round2(toNumber(invoice.amountPaid) + allocatedAmount);
    const newOutstanding = round2(toNumber(invoice.outstandingAmount) - allocatedAmount);
    const nextStatus = newOutstanding <= 0 ? InvoiceStatus.FULLY_PAID : InvoiceStatus.PARTIALLY_PAID;

    await tx.invoice.update({
      where: { id: invoice.id },
      data: {
        amountPaid: newAmountPaid,
        outstandingAmount: newOutstanding,
        status: nextStatus,
        updatedById: actor.userId
      }
    });

    await tx.payment.update({
      where: { id: payment.id },
      data: {
        unappliedAmount: round2(toNumber(payment.unappliedAmount) - allocatedAmount),
        updatedById: actor.userId
      }
    });

    return allocation;
  });

