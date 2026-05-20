import { InvoiceStatus } from "@prisma/client";
import prisma from "../config/prisma.js";
import { toNumber } from "../utils/money.js";

export const creditInvoicesReport = async (context) =>
  prisma.invoice.findMany({
    where: {
      deletedAt: null,
      billingType: { in: ["CREDIT", "INSURANCE"] },
      ...(context.tenantId ? { tenantId: context.tenantId } : {}),
      ...(context.branchId ? { branchId: context.branchId } : {})
    },
    include: {
      patient: true,
      creditCustomer: true,
      scheme: true
    },
    orderBy: { createdAt: "desc" }
  });

export const outstandingBalancesReport = async (context) =>
  prisma.invoice.findMany({
    where: {
      deletedAt: null,
      billingType: { in: ["CREDIT", "INSURANCE"] },
      outstandingAmount: { gt: 0 },
      status: { in: [InvoiceStatus.APPROVED, InvoiceStatus.SUBMITTED_TO_PAYER, InvoiceStatus.PARTIALLY_PAID] },
      ...(context.tenantId ? { tenantId: context.tenantId } : {}),
      ...(context.branchId ? { branchId: context.branchId } : {})
    },
    include: {
      creditCustomer: true,
      patient: true
    }
  });

export const tenantSummaryReport = async (context) => {
  const where = {
    deletedAt: null,
    ...(context.tenantId ? { tenantId: context.tenantId } : {})
  };

  const invoices = await prisma.invoice.findMany({
    where,
    select: {
      tenantId: true,
      netAmount: true,
      creditAmount: true,
      amountPaid: true,
      outstandingAmount: true
    }
  });

  const summary = {};
  invoices.forEach((inv) => {
    const key = inv.tenantId;
    if (!summary[key]) {
      summary[key] = {
        tenantId: inv.tenantId,
        invoiceCount: 0,
        netAmount: 0,
        creditAmount: 0,
        amountPaid: 0,
        outstandingAmount: 0
      };
    }
    summary[key].invoiceCount += 1;
    summary[key].netAmount += toNumber(inv.netAmount);
    summary[key].creditAmount += toNumber(inv.creditAmount);
    summary[key].amountPaid += toNumber(inv.amountPaid);
    summary[key].outstandingAmount += toNumber(inv.outstandingAmount);
  });

  return Object.values(summary);
};

export const branchSummaryReport = async (context) => {
  const where = {
    deletedAt: null,
    ...(context.tenantId ? { tenantId: context.tenantId } : {}),
    ...(context.branchId ? { branchId: context.branchId } : {})
  };

  const invoices = await prisma.invoice.findMany({
    where,
    select: {
      branchId: true,
      netAmount: true,
      creditAmount: true,
      amountPaid: true,
      outstandingAmount: true
    }
  });

  const summary = {};
  invoices.forEach((inv) => {
    const key = inv.branchId;
    if (!summary[key]) {
      summary[key] = {
        branchId: inv.branchId,
        invoiceCount: 0,
        netAmount: 0,
        creditAmount: 0,
        amountPaid: 0,
        outstandingAmount: 0
      };
    }
    summary[key].invoiceCount += 1;
    summary[key].netAmount += toNumber(inv.netAmount);
    summary[key].creditAmount += toNumber(inv.creditAmount);
    summary[key].amountPaid += toNumber(inv.amountPaid);
    summary[key].outstandingAmount += toNumber(inv.outstandingAmount);
  });
  return Object.values(summary);
};

