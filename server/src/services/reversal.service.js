import { InvoiceStatus, ApprovalAction } from "@prisma/client";
import prisma from "../config/prisma.js";
import ApiError from "../utils/apiError.js";
import { round2, toNumber } from "../utils/money.js";
import { generateReversalNo } from "../utils/numbering.js";

/**
 * Get reversal by ID
 */
export const getReversalById = async (id, context) => {
  const reversal = await prisma.invoiceReversal.findFirst({
    where: { 
      id, 
      deletedAt: null,
      ...(context.tenantId ? { tenantId: context.tenantId } : {})
    },
    include: {
      invoice: {
        include: {
          patient: true,
          visit: true,
          creditCustomer: true,
          scheme: true
        }
      },
      approver: true
    }
  });
  
  if (!reversal) throw new ApiError(404, "Reversal not found");
  return reversal;
};

/**
 * List reversals for an invoice
 */
export const getInvoiceReversals = async (invoiceId, context) => {
  const invoice = await prisma.invoice.findFirst({
    where: { 
      id: invoiceId, 
      deletedAt: null,
      ...(context.tenantId ? { tenantId: context.tenantId } : {})
    }
  });
  
  if (!invoice) throw new ApiError(404, "Invoice not found");
  
  return prisma.invoiceReversal.findMany({
    where: { 
      invoiceId, 
      deletedAt: null 
    },
    include: {
      approver: true
    },
    orderBy: { createdAt: "desc" }
  });
};

/**
 * List all reversals with filters
 */
export const listReversals = async (filters, context) => {
  const {
    startDate,
    endDate,
    invoiceId,
    status,
    branchId
  } = filters || {};

  const where = {
    deletedAt: null,
    ...(context.tenantId ? { tenantId: context.tenantId } : {}),
    ...(branchId || context.branchId ? { branchId: branchId || context.branchId } : {}),
    ...(invoiceId ? { invoiceId } : {}),
    ...(startDate || endDate ? {
      createdAt: {
        ...(startDate ? { gte: new Date(startDate) } : {}),
        ...(endDate ? { lte: new Date(endDate) } : {})
      }
    } : {})
  };

  return prisma.invoiceReversal.findMany({
    where,
    include: {
      invoice: {
        include: {
          patient: true,
          visit: true
        }
      },
      approver: true
    },
    orderBy: { createdAt: "desc" }
  });
};

/**
 * Reverse a payment independently (for standalone payments)
 */
export const reversePayment = async (paymentId, reason, actor, context) => {
  return prisma.$transaction(async (tx) => {
    const payment = await tx.payment.findFirst({
      where: { 
        id: paymentId, 
        deletedAt: null,
        ...(context.tenantId ? { tenantId: context.tenantId } : {})
      },
      include: {
        allocations: {
          where: { deletedAt: null },
          include: {
            invoice: true
          }
        }
      }
    });

    if (!payment) throw new ApiError(404, "Payment not found");

    if (payment.reversedAt) {
      throw new ApiError(400, "Payment is already reversed");
    }

    if (!reason || reason.trim().length === 0) {
      throw new ApiError(400, "Reversal reason is mandatory");
    }

    // Reverse all allocations
    for (const allocation of payment.allocations) {
      // Update invoice to reverse the payment effect
      await tx.invoice.update({
        where: { id: allocation.invoiceId },
        data: {
          amountPaid: { decrement: toNumber(allocation.allocatedAmount) },
          outstandingAmount: { increment: toNumber(allocation.allocatedAmount) },
          status: InvoiceStatus.PARTIALLY_PAID
        }
      });

      // Mark allocation as deleted
      await tx.paymentAllocation.update({
        where: { id: allocation.id },
        data: {
          deletedAt: new Date(),
          updatedById: actor.userId
        }
      });
    }

    // Mark payment as reversed
    const updatedPayment = await tx.payment.update({
      where: { id: paymentId },
      data: {
        reversedById: actor.userId,
        reversedAt: new Date(),
        updatedById: actor.userId
      }
    });

    return updatedPayment;
  });
};

/**
 * Get reversal statistics
 */
export const getReversalStats = async (filters, context) => {
  const {
    startDate,
    endDate,
    branchId
  } = filters || {};

  const where = {
    deletedAt: null,
    ...(context.tenantId ? { tenantId: context.tenantId } : {}),
    ...(branchId || context.branchId ? { branchId: branchId || context.branchId } : {}),
    ...(startDate || endDate ? {
      createdAt: {
        ...(startDate ? { gte: new Date(startDate) } : {}),
        ...(endDate ? { lte: new Date(endDate) } : {})
      }
    } : {})
  };

  const stats = await prisma.invoiceReversal.aggregate({
    where,
    _sum: {
      reversalAmount: true
    },
    _count: true
  });

  // Get reversals by reason (top 10)
  const reversals = await prisma.invoiceReversal.findMany({
    where,
    select: {
      reason: true,
      reversalAmount: true
    }
  });

  const reasonBreakdown = reversals.reduce((acc, r) => {
    acc[r.reason] = (acc[r.reason] || 0) + 1;
    return acc;
  }, {});

  return {
    totalReversals: stats._count,
    totalReversedAmount: round2(stats._sum.reversalAmount || 0),
    reasonBreakdown,
    period: {
      startDate,
      endDate
    }
  };
};

/**
 * Void a receipt (soft delete with audit)
 */
export const voidReceipt = async (receiptId, reason, actor, context) => {
  return prisma.$transaction(async (tx) => {
    const receipt = await tx.receipt.findFirst({
      where: {
        id: receiptId,
        deletedAt: null,
        ...(context.tenantId ? { tenantId: context.tenantId } : {})
      },
      include: {
        payment: true,
        allocation: {
          include: {
            invoice: true
          }
        }
      }
    });

    if (!receipt) throw new ApiError(404, "Receipt not found");

    if (receipt.voidedAt) {
      throw new ApiError(400, "Receipt is already voided");
    }

    if (!reason || reason.trim().length === 0) {
      throw new ApiError(400, "Void reason is mandatory");
    }

    // Mark receipt as voided
    const voidedReceipt = await tx.receipt.update({
      where: { id: receiptId },
      data: {
        voidedById: actor.userId,
        voidedAt: new Date(),
        voidReason: reason,
        updatedById: actor.userId
      }
    });

    // If receipt has allocation, we may need to handle invoice status
    if (receipt.allocation) {
      // Note: This doesn't reverse the payment, just marks receipt as void
      // Full reversal should be done through reverseInvoice or reversePayment
    }

    return voidedReceipt;
  });
};

/**
 * Reprint receipt (track reprint count)
 */
export const reprintReceipt = async (receiptId, actor, context) => {
  const receipt = await prisma.receipt.findFirst({
    where: {
      id: receiptId,
      deletedAt: null,
      ...(context.tenantId ? { tenantId: context.tenantId } : {})
    }
  });

  if (!receipt) throw new ApiError(404, "Receipt not found");

  if (receipt.voidedAt) {
    throw new ApiError(400, "Cannot reprint a voided receipt");
  }

  return prisma.receipt.update({
    where: { id: receiptId },
    data: {
      reprintCount: { increment: 1 },
      lastReprintedAt: new Date(),
      updatedById: actor.userId
    }
  });
};
