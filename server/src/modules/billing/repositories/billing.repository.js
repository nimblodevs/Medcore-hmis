import { prisma } from "../../../utils/prisma.js";
import { generateBillNumber } from "../services/billing-number.service.js";

export class BillingRepository {
  async createBill(data, user) {
    const { tenantId, branchId, actorId } = user;

    return prisma.$transaction(async (tx) => {
      const billNumber = await generateBillNumber(tx, tenantId);

      const bill = await tx.patientBill.create({
        data: {
          ...data,
          tenantId,
          branchId: branchId || null,
          billNumber,
          createdById: actorId,
          updatedById: actorId
        },
        include: {
          items: false,
          adjustments: false
        }
      });

      await tx.billingAuditLog.create({
        data: {
          tenantId,
          billId: bill.id,
          patientId: data.patientId,
          actorId,
          action: "BILL_CREATED",
          entityType: "PatientBill",
          entityId: bill.id,
          newValues: data
        }
      });

      return bill;
    });
  }

  async findBillById(id, tenantId) {
    return prisma.patientBill.findUnique({
      where: { id, tenantId },
      include: {
        items: {
          orderBy: { createdAt: 'asc' }
        },
        adjustments: {
          orderBy: { createdAt: 'desc' }
        },
        payments: {
          orderBy: { linkedAt: 'desc' }
        }
      }
    });
  }

  async findBills(tenantId, options = {}) {
    const {
      patientId,
      patientVisitId,
      payerType,
      status,
      paymentStatus,
      debtorAccountId,
      debtorSchemeId,
      search,
      limit = 50,
      offset = 0
    } = options;

    const where = {
      tenantId,
      ...(patientId ? { patientId } : {}),
      ...(patientVisitId ? { patientVisitId } : {}),
      ...(payerType ? { payerType } : {}),
      ...(status ? { status } : {}),
      ...(paymentStatus ? { paymentStatus } : {}),
      ...(debtorAccountId ? { debtorAccountId } : {}),
      ...(debtorSchemeId ? { debtorSchemeId } : {}),
      ...(search ? {
        OR: [
          { billNumber: { contains: search, mode: 'insensitive' } },
          { notes: { contains: search, mode: 'insensitive' } }
        ]
      } : {})
    };

    const [bills, total] = await Promise.all([
      prisma.patientBill.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        include: {
          items: {
            select: {
              id: true,
              description: true,
              grossAmount: true,
              netAmount: true,
              status: true
            }
          },
          _count: {
            select: {
              items: true,
              payments: true
            }
          }
        }
      }),
      prisma.patientBill.count({ where })
    ]);

    return { bills, total };
  }

  async updateBill(id, data, user) {
    const { tenantId, actorId } = user;

    return prisma.$transaction(async (tx) => {
      const bill = await tx.patientBill.update({
        where: { id, tenantId },
        data: {
          ...data,
          updatedById: actorId
        }
      });

      await tx.billingAuditLog.create({
        data: {
          tenantId,
          billId: bill.id,
          actorId,
          action: "BILL_UPDATED",
          entityType: "PatientBill",
          entityId: bill.id,
          previousValues: {},
          newValues: data
        }
      });

      return bill;
    });
  }

  async cancelBill(id, reason, user) {
    const { tenantId, actorId } = user;

    return prisma.$transaction(async (tx) => {
      const bill = await tx.patientBill.update({
        where: { id, tenantId },
        data: {
          status: "CANCELLED",
          cancelledById: actorId,
          cancelledAt: new Date(),
          cancellationReason: reason
        }
      });

      await tx.billingAuditLog.create({
        data: {
          tenantId,
          billId: bill.id,
          actorId,
          action: "BILL_CANCELLED",
          entityType: "PatientBill",
          entityId: bill.id,
          newValues: { status: "CANCELLED", reason }
        }
      });

      return bill;
    });
  }

  async addBillItem(billId, itemData, user) {
    const { tenantId, branchId, actorId } = user;

    return prisma.$transaction(async (tx) => {
      const bill = await tx.patientBill.findUnique({
        where: { id: billId, tenantId }
      });

      if (!bill) {
        throw new Error("Bill not found");
      }

      const grossAmount = itemData.quantity * itemData.unitPrice;
      const netAmount = grossAmount - (itemData.discountAmount || 0) - (itemData.waiverAmount || 0);

      const item = await tx.patientBillItem.create({
        data: {
          ...itemData,
          tenantId,
          branchId: branchId || null,
          billId,
          patientId: bill.patientId,
          patientVisitId: bill.patientVisitId,
          grossAmount,
          netAmount,
          createdById: actorId
        }
      });

      await this.recalculateBillTotals(tx, billId);

      await tx.billingAuditLog.create({
        data: {
          tenantId,
          billId,
          patientId: bill.patientId,
          actorId,
          action: "BILL_ITEM_ADDED",
          entityType: "PatientBillItem",
          entityId: item.id,
          newValues: itemData
        }
      });

      return item;
    });
  }

  async recalculateBillTotals(tx, billId) {
    const items = await tx.patientBillItem.findMany({
      where: { billId }
    });

    const totals = items.reduce((acc, item) => {
      acc.grossAmount += item.grossAmount.toNumber();
      acc.discountAmount += item.discountAmount.toNumber();
      acc.waiverAmount += item.waiverAmount.toNumber();
      acc.netAmount += item.netAmount.toNumber();
      acc.patientPayableAmount += item.patientPayableAmount.toNumber();
      acc.debtorPayableAmount += item.debtorPayableAmount.toNumber();
      return acc;
    }, {
      grossAmount: 0,
      discountAmount: 0,
      waiverAmount: 0,
      netAmount: 0,
      patientPayableAmount: 0,
      debtorPayableAmount: 0
    });

    const payments = await tx.billingPaymentLink.findMany({
      where: { billId }
    });

    const paidAmount = payments.reduce((sum, p) => sum + p.amount.toNumber(), 0);

    const outstandingAmount = totals.patientPayableAmount - paidAmount;

    let paymentStatus = "UNPAID";
    if (paidAmount > 0) {
      paymentStatus = paidAmount >= totals.patientPayableAmount ? "PAID" : "PARTIALLY_PAID";
    }

    await tx.patientBill.update({
      where: { id: billId },
      data: {
        ...totals,
        paidAmount,
        outstandingAmount,
        paymentStatus
      }
    });

    return totals;
  }

  async reverseBillItem(itemId, reason, user) {
    const { tenantId, actorId } = user;

    return prisma.$transaction(async (tx) => {
      const item = await tx.patientBillItem.update({
        where: { id: itemId, tenantId },
        data: {
          status: "REVERSED",
          reversedById: actorId,
          reversedAt: new Date(),
          reversalReason: reason
        }
      });

      await this.recalculateBillTotals(tx, item.billId);

      await tx.billingAuditLog.create({
        data: {
          tenantId,
          billId: item.billId,
          actorId,
          action: "BILL_ITEM_REVERSED",
          entityType: "PatientBillItem",
          entityId: item.id,
          newValues: { status: "REVERSED", reason }
        }
      });

      return item;
    });
  }

  async linkCashPayment(billId, paymentData, user) {
    const { tenantId, branchId, actorId } = user;

    return prisma.$transaction(async (tx) => {
      const link = await tx.billingPaymentLink.create({
        data: {
          tenantId,
          branchId: branchId || null,
          billId,
          cashPaymentId: paymentData.cashPaymentId || null,
          cashSessionId: paymentData.cashSessionId || null,
          amount: paymentData.amount,
          linkedById: actorId
        }
      });

      await this.recalculateBillTotals(tx, billId);

      await tx.billingAuditLog.create({
        data: {
          tenantId,
          billId,
          actorId,
          action: "CASH_PAYMENT_LINKED",
          entityType: "BillingPaymentLink",
          entityId: link.id,
          newValues: paymentData
        }
      });

      return link;
    });
  }

  async applyAdjustment(billId, adjustmentData, user) {
    const { tenantId, branchId, actorId } = user;

    return prisma.$transaction(async (tx) => {
      const adjustment = await tx.billingAdjustment.create({
        data: {
          tenantId,
          branchId: branchId || null,
          billId,
          billItemId: adjustmentData.billItemId || null,
          adjustmentType: adjustmentData.adjustmentType,
          amount: adjustmentData.amount,
          reason: adjustmentData.reason,
          createdById: actorId
        }
      });

      await tx.billingAuditLog.create({
        data: {
          tenantId,
          billId,
          actorId,
          action: adjustmentData.adjustmentType === "DISCOUNT" ? "DISCOUNT_APPLIED" :
                 adjustmentData.adjustmentType === "WAIVER" ? "WAIVER_APPLIED" :
                 "PRICE_OVERRIDE_APPLIED",
          entityType: "BillingAdjustment",
          entityId: adjustment.id,
          newValues: adjustmentData
        }
      });

      return adjustment;
    });
  }

  async postToCredit(billId, invoiceId, user) {
    const { tenantId, actorId } = user;

    return prisma.$transaction(async (tx) => {
      const bill = await tx.patientBill.update({
        where: { id: billId, tenantId },
        data: {
          creditInvoiceId: invoiceId,
          status: "POSTED_TO_CREDIT",
          postedToCreditById: actorId,
          postedToCreditAt: new Date()
        }
      });

      await tx.patientBillItem.updateMany({
        where: {
          billId,
          debtorPayableAmount: { gt: 0 }
        },
        data: {
          status: "POSTED_TO_CREDIT"
        }
      });

      await tx.billingAuditLog.create({
        data: {
          tenantId,
          billId,
          actorId,
          action: "CREDIT_POSTED",
          entityType: "PatientBill",
          entityId: bill.id,
          newValues: { creditInvoiceId: invoiceId }
        }
      });

      return bill;
    });
  }

  async getBillingReports(tenantId, options = {}) {
    const { startDate, endDate, departmentId, servicePointId, payerType } = options;

    const where = {
      tenantId,
      createdAt: {
        gte: startDate ? new Date(startDate) : undefined,
        lte: endDate ? new Date(endDate) : undefined
      },
      ...(departmentId ? { items: { some: { departmentId } } } : {}),
      ...(servicePointId ? { items: { some: { servicePointId } } } : {}),
      ...(payerType ? { payerType } : {})
    };

    const bills = await prisma.patientBill.findMany({
      where,
      include: {
        items: {
          where: {
            ...(departmentId ? { departmentId } : {}),
            ...(servicePointId ? { servicePointId } : {})
          }
        }
      }
    });

    const summary = bills.reduce((acc, bill) => {
      acc.totalBills++;
      acc.grossAmount += bill.grossAmount.toNumber();
      acc.netAmount += bill.netAmount.toNumber();
      acc.paidAmount += bill.paidAmount.toNumber();
      acc.outstandingAmount += bill.outstandingAmount.toNumber();

      if (bill.payerType === "CASH") {
        acc.cashBills++;
        acc.cashAmount += bill.netAmount.toNumber();
      } else {
        acc.creditBills++;
        acc.creditAmount += bill.netAmount.toNumber();
      }

      return acc;
    }, {
      totalBills: 0,
      grossAmount: 0,
      netAmount: 0,
      paidAmount: 0,
      outstandingAmount: 0,
      cashBills: 0,
      cashAmount: 0,
      creditBills: 0,
      creditAmount: 0
    });

    return summary;
  }
}

export const billingRepository = new BillingRepository();
