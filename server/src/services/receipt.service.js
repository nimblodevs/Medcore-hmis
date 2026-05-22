import prisma from "../config/prisma.js";
import ApiError from "../utils/apiError.js";
import { generateReceiptNo } from "../utils/numbering.js";
import { round2, toNumber } from "../utils/money.js";

export const createReceipt = async (payload, actor, context) =>
  prisma.$transaction(async (tx) => {
    const payment = await tx.payment.findFirst({
      where: { id: payload.paymentId, deletedAt: null, ...(context.tenantId ? { tenantId: context.tenantId } : {}) }
    });
    if (!payment) throw new ApiError(404, "Payment not found");

    let allocation = null;
    if (payload.paymentAllocationId) {
      allocation = await tx.paymentAllocation.findFirst({
        where: { id: payload.paymentAllocationId, deletedAt: null, ...(context.tenantId ? { tenantId: context.tenantId } : {}) }
      });
      if (!allocation) throw new ApiError(404, "Payment allocation not found");
      if (allocation.paymentId !== payment.id) {
        throw new ApiError(400, "Payment allocation does not belong to the specified payment");
      }
    }

    // Generate receipt number from backend sequence
    const tenantId = context.tenantId || payment.tenantId;
    const branchId = context.branchId || payment.branchId;
    const receiptCode = await generateReceiptNo(tenantId, branchId);

    const amount = allocation ? toNumber(allocation.allocatedAmount) : payload.amount;

    return tx.receipt.create({
      data: {
        tenantId,
        branchId,
        receiptNo: receiptCode,
        receiptDate: payload.receiptDate,
        invoiceId: payload.invoiceId || allocation?.invoiceId || null,
        paymentId: payment.id,
        paymentAllocationId: allocation?.id || null,
        patientId: payment.patientId || null,
        amount: round2(amount),
        createdById: actor.userId,
        updatedById: actor.userId
      }
    });
  });

export const getReceiptById = async (id, context) => {
  const receipt = await prisma.receipt.findFirst({
    where: { id, deletedAt: null, ...(context.tenantId ? { tenantId: context.tenantId } : {}) },
    include: { payment: true, invoice: true, patient: true, allocation: true }
  });
  if (!receipt) throw new ApiError(404, "Receipt not found");
  return receipt;
};

export const getInvoiceReceipts = async (invoiceId, context) =>
  prisma.receipt.findMany({
    where: {
      invoiceId,
      deletedAt: null,
      ...(context.tenantId ? { tenantId: context.tenantId } : {})
    },
    orderBy: { receiptDate: "desc" }
  });

