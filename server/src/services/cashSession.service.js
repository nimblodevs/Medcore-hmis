import prisma from "../config/prisma.js";
import ApiError from "../utils/apiError.js";
import { AuditService } from "./audit.service.js";
import { sessionNo, refundNo, handoverNo } from "../utils/numbering.js";

const auditService = new AuditService();

export class CashSessionService {
  async getAll(tenantId, branchId, options = {}) {
    const { cashierId, counterId, status, search, page = 1, limit = 50 } = options;
    
    const where = {
      tenantId,
      deletedAt: null
    };

    if (branchId) {
      where.branchId = branchId;
    }

    if (cashierId) {
      where.cashierId = cashierId;
    }

    if (counterId) {
      where.counterId = counterId;
    }

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { sessionNumber: { contains: search, mode: "insensitive" } },
        { cashier: { firstName: { contains: search, mode: "insensitive" } } },
        { cashier: { lastName: { contains: search, mode: "insensitive" } } },
        { counter: { name: { contains: search, mode: "insensitive" } } }
      ];
    }

    const skip = (page - 1) * limit;
    const take = parseInt(limit, 10);

    const [sessions, total] = await Promise.all([
      prisma.cashSession.findMany({
        where,
        skip,
        take,
        include: {
          branch: { select: { id: true, name: true, code: true } },
          counter: { select: { id: true, name: true, code: true } },
          cashier: { 
            select: { 
              id: true, 
              firstName: true, 
              lastName: true, 
              staffNumber: true,
              email: true 
            } 
          },
          handover: { select: { id: true, handoverNumber: true, reviewStatus: true } },
          _count: { select: { payments: true, refunds: true } }
        },
        orderBy: { createdAt: "desc" }
      }),
      prisma.cashSession.count({ where })
    ]);

    return { data: sessions, total, page, limit };
  }

  async getById(tenantId, id) {
    const session = await prisma.cashSession.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: {
        branch: { select: { id: true, name: true, code: true } },
        counter: { select: { id: true, name: true, code: true, department: true } },
        cashier: { 
          select: { 
            id: true, 
            firstName: true, 
            lastName: true, 
            staffNumber: true,
            email: true,
            phone: true
          } 
        },
        payments: {
          orderBy: { createdAt: "desc" },
          include: {
            createdBy: { select: { id: true, firstName: true, lastName: true } }
          }
        },
        refunds: {
          orderBy: { createdAt: "desc" },
          include: {
            requestedBy: { select: { id: true, firstName: true, lastName: true } },
            approvedBy: { select: { id: true, firstName: true, lastName: true } }
          }
        },
        handover: {
          include: {
            submittedBy: { select: { id: true, firstName: true, lastName: true } },
            reviewedBy: { select: { id: true, firstName: true, lastName: true } }
          }
        }
      }
    });

    if (!session) {
      throw new ApiError(404, "Cash session not found");
    }

    return session;
  }

  async getOpenSession(tenantId, cashierId) {
    const session = await prisma.cashSession.findFirst({
      where: {
        tenantId,
        cashierId,
        status: "OPEN",
        deletedAt: null
      },
      include: {
        counter: { select: { id: true, name: true, code: true } },
        cashier: { select: { id: true, firstName: true, lastName: true } }
      }
    });

    return session;
  }

  async open(tenantId, branchId, userId, data) {
    // Check if cashier already has an open session
    const existingOpen = await this.getOpenSession(tenantId, data.cashierId);
    if (existingOpen) {
      throw new ApiError(400, "Cashier already has an open session");
    }

    // Verify counter is active
    const counter = await prisma.cashCounter.findFirst({
      where: { id: data.counterId, tenantId, isActive: true, deletedAt: null }
    });

    if (!counter) {
      throw new ApiError(400, "Counter not found or inactive");
    }

    // Verify cashier exists and is active
    const cashier = await prisma.cashierProfile.findFirst({
      where: { id: data.cashierId, tenantId, isActive: true, deletedAt: null }
    });

    if (!cashier) {
      throw new ApiError(400, "Cashier not found or inactive");
    }

    // Generate session number
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const count = await prisma.cashSession.count({
      where: {
        tenantId,
        sessionNumber: { startsWith: `CS-${today}-` }
      }
    });

    const session = await prisma.cashSession.create({
      data: {
        tenantId,
        branchId,
        counterId: data.counterId,
        cashierId: data.cashierId,
        sessionNumber: sessionNo(count),
        openingFloat: data.openingFloat || 0,
        currency: data.currency || "KES",
        openingNotes: data.openingNotes,
        openedById: userId,
        status: "OPEN"
      },
      include: {
        counter: { select: { id: true, name: true, code: true } },
        cashier: { select: { id: true, firstName: true, lastName: true, staffNumber: true } }
      }
    });

    await auditService.log({
      tenantId,
      action: "CASH_SESSION_OPENED",
      entityType: "CashSession",
      entityId: session.id,
      performedBy: userId,
      details: { session }
    });

    return session;
  }

  async close(tenantId, sessionId, userId, data) {
    const session = await this.getById(tenantId, sessionId);

    if (session.status !== "OPEN") {
      throw new ApiError(400, "Session is not open");
    }

    // Calculate totals
    const totalPayments = await prisma.cashPayment.aggregate({
      where: { sessionId },
      _sum: { amount: true }
    });

    const totalRefunds = await prisma.cashRefund.aggregate({
      where: { sessionId, status: "APPROVED" },
      _sum: { amount: true }
    });

    const expectedCash = session.openingFloat.toNumber() + (totalPayments._sum.amount?.toNumber() || 0) - (totalRefunds._sum.amount?.toNumber() || 0);
    const actualCash = data.actualCash;
    const variance = actualCash - expectedCash;

    const updated = await prisma.cashSession.update({
      where: { id: sessionId },
      data: {
        status: "CLOSED",
        expectedCash,
        actualCash,
        variance,
        closingNotes: data.closingNotes,
        closedAt: new Date(),
        closedById: userId
      },
      include: {
        counter: { select: { id: true, name: true, code: true } },
        cashier: { select: { id: true, firstName: true, lastName: true } }
      }
    });

    await auditService.log({
      tenantId,
      action: "CASH_SESSION_CLOSED",
      entityType: "CashSession",
      entityId: sessionId,
      performedBy: userId,
      details: { expectedCash, actualCash, variance }
    });

    return updated;
  }

  async recordPayment(tenantId, userId, data) {
    // Verify session exists and is open
    const session = await prisma.cashSession.findFirst({
      where: { id: data.sessionId, tenantId, status: "OPEN", deletedAt: null }
    });

    if (!session) {
      throw new ApiError(400, "Session not found or not open");
    }

    const payment = await prisma.cashPayment.create({
      data: {
        tenantId: session.tenantId,
        branchId: session.branchId,
        sessionId: data.sessionId,
        paymentMethod: data.paymentMethod,
        amount: data.amount,
        referenceNo: data.referenceNo,
        payerName: data.payerName,
        payerDetails: data.payerDetails,
        invoiceNo: data.invoiceNo,
        receiptNo: data.receiptNo,
        notes: data.notes,
        createdById: userId
      },
      include: {
        session: {
          select: {
            id: true,
            sessionNumber: true,
            cashier: { select: { firstName: true, lastName: true } }
          }
        }
      }
    });

    await auditService.log({
      tenantId,
      action: "CASH_PAYMENT_RECORDED",
      entityType: "CashPayment",
      entityId: payment.id,
      performedBy: userId,
      details: { payment }
    });

    return payment;
  }

  async requestRefund(tenantId, branchId, userId, data) {
    // Verify session exists
    const session = await prisma.cashSession.findFirst({
      where: { id: data.sessionId, tenantId, deletedAt: null }
    });

    if (!session) {
      throw new ApiError(400, "Session not found");
    }

    // Generate refund number
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const count = await prisma.cashRefund.count({
      where: {
        tenantId,
        refundNumber: { startsWith: `REF-${today}-` }
      }
    });

    const refund = await prisma.cashRefund.create({
      data: {
        tenantId,
        branchId,
        sessionId: data.sessionId,
        refundNumber: refundNo(count),
        originalPaymentId: data.originalPaymentId,
        originalReceiptNo: data.originalReceiptNo,
        amount: data.amount,
        reason: data.reason,
        refundMethod: data.refundMethod,
        referenceNo: data.referenceNo,
        notes: data.notes,
        requestedById: userId,
        status: "PENDING"
      },
      include: {
        session: {
          select: {
            id: true,
            sessionNumber: true,
            cashier: { select: { firstName: true, lastName: true } }
          }
        }
      }
    });

    await auditService.log({
      tenantId,
      action: "CASH_REFUND_REQUESTED",
      entityType: "CashRefund",
      entityId: refund.id,
      performedBy: userId,
      details: { refund }
    });

    return refund;
  }

  async approveRefund(tenantId, refundId, userId, data) {
    const refund = await prisma.cashRefund.findFirst({
      where: { id: refundId, tenantId, deletedAt: null }
    });

    if (!refund) {
      throw new ApiError(404, "Refund not found");
    }

    if (refund.status !== "PENDING") {
      throw new ApiError(400, "Refund is not pending approval");
    }

    const updated = await prisma.cashRefund.update({
      where: { id: refundId },
      data: {
        status: "APPROVED",
        approvedById: userId,
        approvedAt: new Date(),
        notes: data.notes
      },
      include: {
        session: { select: { id: true, sessionNumber: true } }
      }
    });

    await auditService.log({
      tenantId,
      action: "CASH_REFUND_APPROVED",
      entityType: "CashRefund",
      entityId: refundId,
      performedBy: userId,
      details: { refund: updated }
    });

    return updated;
  }

  async rejectRefund(tenantId, refundId, userId, data) {
    const refund = await prisma.cashRefund.findFirst({
      where: { id: refundId, tenantId, deletedAt: null }
    });

    if (!refund) {
      throw new ApiError(404, "Refund not found");
    }

    if (refund.status !== "PENDING") {
      throw new ApiError(400, "Refund is not pending approval");
    }

    const updated = await prisma.cashRefund.update({
      where: { id: refundId },
      data: {
        status: "REJECTED",
        rejectedById: userId,
        rejectedAt: new Date(),
        rejectionReason: data.rejectionReason
      }
    });

    await auditService.log({
      tenantId,
      action: "CASH_REFUND_REJECTED",
      entityType: "CashRefund",
      entityId: refundId,
      performedBy: userId,
      details: { reason: data.rejectionReason }
    });

    return updated;
  }

  async submitHandover(tenantId, userId, data) {
    const session = await this.getById(tenantId, data.sessionId);

    if (session.status !== "CLOSED") {
      throw new ApiError(400, "Session must be closed before handover");
    }

    if (session.handover) {
      throw new ApiError(400, "Handover already submitted for this session");
    }

    // Calculate totals
    const totalPayments = await prisma.cashPayment.aggregate({
      where: { sessionId: data.sessionId },
      _sum: { amount: true }
    });

    const totalRefunds = await prisma.cashRefund.aggregate({
      where: { sessionId: data.sessionId, status: "APPROVED" },
      _sum: { amount: true }
    });

    const totalCashCollected = totalPayments._sum.amount?.toNumber() || 0;
    const totalRefundsAmount = totalRefunds._sum.amount?.toNumber() || 0;
    const netCash = totalCashCollected - totalRefundsAmount;
    const expectedClosing = session.openingFloat.toNumber() + netCash;
    const variance = data.actualCounted - expectedClosing;

    // Generate handover number
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const count = await prisma.cashHandover.count({
      where: {
        tenantId,
        handoverNumber: { startsWith: `HO-${today}-` }
      }
    });

    const handover = await prisma.cashHandover.create({
      data: {
        tenantId,
        branchId: session.branchId,
        sessionId: data.sessionId,
        handoverNumber: handoverNo(count),
        totalCashCollected,
        totalRefunds: totalRefundsAmount,
        netCash,
        openingFloat: session.openingFloat.toNumber(),
        expectedClosing,
        actualCounted: data.actualCounted,
        variance,
        varianceReason: data.varianceReason,
        submittedById: userId
      },
      include: {
        session: {
          select: {
            id: true,
            sessionNumber: true,
            cashier: { select: { firstName: true, lastName: true, staffNumber: true } }
          }
        }
      }
    });

    // Update session status
    await prisma.cashSession.update({
      where: { id: data.sessionId },
      data: { status: "PENDING_APPROVAL" }
    });

    await auditService.log({
      tenantId,
      action: "CASH_HANDOVER_SUBMITTED",
      entityType: "CashHandover",
      entityId: handover.id,
      performedBy: userId,
      details: { handover }
    });

    return handover;
  }

  async reviewHandover(tenantId, handoverId, userId, data) {
    const handover = await prisma.cashHandover.findFirst({
      where: { id: handoverId, tenantId, deletedAt: null },
      include: { session: true }
    });

    if (!handover) {
      throw new ApiError(404, "Handover not found");
    }

    const reviewStatus = data.reviewStatus;
    const sessionStatus = reviewStatus === "APPROVED" ? "APPROVED" : "REJECTED";

    const updated = await prisma.cashHandover.update({
      where: { id: handoverId },
      data: {
        reviewStatus,
        reviewNotes: data.reviewNotes,
        reviewedById: userId,
        reviewedAt: new Date()
      },
      include: {
        session: {
          select: {
            id: true,
            sessionNumber: true,
            cashier: { select: { firstName: true, lastName: true } }
          }
        }
      }
    });

    // Update session status
    await prisma.cashSession.update({
      where: { id: handover.sessionId },
      data: {
        status: sessionStatus,
        approvedAt: reviewStatus === "APPROVED" ? new Date() : null,
        approvedById: reviewStatus === "APPROVED" ? userId : null,
        rejectedAt: reviewStatus === "REJECTED" ? new Date() : null,
        rejectedById: reviewStatus === "REJECTED" ? userId : null,
        rejectionReason: reviewStatus === "REJECTED" ? data.reviewNotes : null
      }
    });

    await auditService.log({
      tenantId,
      action: "CASH_HANDOVER_REVIEWED",
      entityType: "CashHandover",
      entityId: handoverId,
      performedBy: userId,
      details: { reviewStatus }
    });

    return updated;
  }

  async getDashboardStats(tenantId, branchId, options = {}) {
    const { dateFrom, dateTo } = options;
    
    const dateFilter = {};
    if (dateFrom || dateTo) {
      dateFilter.openedAt = {};
      if (dateFrom) dateFilter.openedAt.gte = new Date(dateFrom);
      if (dateTo) dateFilter.openedAt.lte = new Date(dateTo);
    }

    const where = {
      tenantId,
      deletedAt: null,
      ...dateFilter
    };

    if (branchId) {
      where.branchId = branchId;
    }

    const [
      totalSessions,
      openSessions,
      closedSessions,
      approvedSessions,
      totalVariance
    ] = await Promise.all([
      prisma.cashSession.count({ where }),
      prisma.cashSession.count({ where: { ...where, status: "OPEN" } }),
      prisma.cashSession.count({ where: { ...where, status: "CLOSED" } }),
      prisma.cashSession.count({ where: { ...where, status: "APPROVED" } }),
      prisma.cashSession.aggregate({
        where: { ...where, variance: { not: null } },
        _sum: { variance: true }
      })
    ]);

    return {
      totalSessions,
      openSessions,
      closedSessions,
      approvedSessions,
      totalVariance: totalVariance._sum.variance?.toNumber() || 0
    };
  }
}
