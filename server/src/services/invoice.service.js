import prisma from "../config/prisma.js";
import ApiError from "../utils/apiError.js";
import { round2, toNumber } from "../utils/money.js";
import { claimNo, invoiceNo } from "../utils/numbering.js";

const InvoiceStatus = {
  DRAFT: "DRAFT",
  PENDING_APPROVAL: "PENDING_APPROVAL",
  APPROVED: "APPROVED",
  SUBMITTED_TO_PAYER: "SUBMITTED_TO_PAYER",
  PARTIALLY_PAID: "PARTIALLY_PAID",
  FULLY_PAID: "FULLY_PAID",
  REJECTED: "REJECTED",
  CANCELLED: "CANCELLED",
  REVERSED: "REVERSED"
};

const BillingType = {
  CASH: "CASH",
  CREDIT: "CREDIT",
  INSURANCE: "INSURANCE"
};

const ApprovalAction = {
  SUBMITTED: "SUBMITTED",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  CANCELLED: "CANCELLED",
  REVERSED: "REVERSED",
  SUBMITTED_TO_PAYER: "SUBMITTED_TO_PAYER",
  CLAIM_GENERATED: "CLAIM_GENERATED"
};

const ClaimStatus = {
  DRAFT: "DRAFT"
};

const ACTIVE_CREDIT_STATUSES = [
  InvoiceStatus.PENDING_APPROVAL,
  InvoiceStatus.APPROVED,
  InvoiceStatus.SUBMITTED_TO_PAYER,
  InvoiceStatus.PARTIALLY_PAID
];

const assertTenantBranchAccess = (record, context) => {
  if (context.tenantId && record.tenantId !== context.tenantId) throw new ApiError(403, "Cross-tenant access denied");
  if (context.branchId && record.branchId !== context.branchId) throw new ApiError(403, "Branch access denied");
};

const ensureInvoiceAmounts = ({ grossAmount, discountAmount, netAmount, patientCopayAmount, creditAmount, items }) => {
  const itemsTotal = round2(items.reduce((sum, item) => sum + toNumber(item.netAmount), 0));
  const computedNet = round2(toNumber(grossAmount) - toNumber(discountAmount));
  const computedCredit = round2(computedNet - toNumber(patientCopayAmount));

  if (round2(netAmount) !== itemsTotal) {
    throw new ApiError(400, "Total invoice net amount must equal sum of invoice items");
  }
  if (round2(netAmount) !== computedNet) {
    throw new ApiError(400, "Net amount must equal gross amount minus discount amount");
  }
  if (round2(creditAmount) !== computedCredit) {
    throw new ApiError(400, "Credit amount must equal net amount minus patient co-pay");
  }
};

const ensureBillingRules = async (tx, payload, context, existingInvoiceId = null) => {
  const visit = await tx.visit.findFirst({
    where: {
      id: payload.visitId,
      deletedAt: null,
      ...(context.tenantId ? { tenantId: context.tenantId } : {})
    }
  });
  if (!visit) throw new ApiError(404, "Visit not found");
  if (visit.visitType !== "OUTPATIENT") throw new ApiError(400, "Only outpatient visits can be invoiced in this workflow");

  const duplicate = await tx.invoice.findFirst({
    where: {
      visitId: payload.visitId,
      billingType: payload.billingType,
      deletedAt: null,
      ...(existingInvoiceId ? { id: { not: existingInvoiceId } } : {}),
      ...(context.tenantId ? { tenantId: context.tenantId } : {})
    }
  });
  if (duplicate) throw new ApiError(409, "Duplicate invoice for this outpatient visit is not allowed");

  if (payload.billingType === BillingType.CREDIT && !payload.creditCustomerId) {
    throw new ApiError(400, "Credit invoice must have a credit customer");
  }

  if (payload.billingType === BillingType.INSURANCE) {
    if (!payload.schemeId) throw new ApiError(400, "Insurance invoice must have a scheme");
    const scheme = await tx.insuranceScheme.findFirst({
      where: { id: payload.schemeId, deletedAt: null, ...(context.tenantId ? { tenantId: context.tenantId } : {}) }
    });
    if (!scheme) throw new ApiError(404, "Insurance scheme not found");
    if (scheme.requiresAuthorization && !payload.authorizationNo) {
      throw new ApiError(400, "Authorization number is required for this insurance scheme");
    }
  }

  if (payload.creditCustomerId) {
    const customer = await tx.creditCustomer.findFirst({
      where: { id: payload.creditCustomerId, deletedAt: null, ...(context.tenantId ? { tenantId: context.tenantId } : {}) }
    });
    if (!customer) throw new ApiError(404, "Credit customer not found");
    const usedCredit = await tx.invoice.aggregate({
      _sum: { outstandingAmount: true },
      where: {
        creditCustomerId: payload.creditCustomerId,
        status: { in: ACTIVE_CREDIT_STATUSES },
        deletedAt: null
      }
    });
    const available = round2(toNumber(customer.creditLimit) - toNumber(usedCredit._sum.outstandingAmount));
    if (round2(payload.creditAmount) > available) {
      throw new ApiError(400, "Credit amount exceeds available credit limit");
    }
  }
};

const createApprovalLog = (tx, data) =>
  tx.invoiceApproval.create({
    data: {
      tenantId: data.tenantId,
      branchId: data.branchId,
      invoiceId: data.invoiceId,
      action: data.action,
      comments: data.comments,
      actedById: data.actedById,
      createdById: data.actedById,
      updatedById: data.actedById
    }
  });

export const listInvoices = async (context) =>
  prisma.invoice.findMany({
    where: {
      deletedAt: null,
      ...(context.tenantId ? { tenantId: context.tenantId } : {}),
      ...(context.branchId ? { branchId: context.branchId } : {})
    },
    include: { items: { where: { deletedAt: null } }, patient: true, visit: true, creditCustomer: true, scheme: true },
    orderBy: { createdAt: "desc" }
  });

export const getInvoiceById = async (id, context) => {
  const invoice = await prisma.invoice.findFirst({
    where: { id, deletedAt: null },
    include: {
      items: { where: { deletedAt: null } },
      patient: true,
      visit: true,
      approvals: { where: { deletedAt: null }, orderBy: { createdAt: "asc" } },
      claim: true,
      receipts: { where: { deletedAt: null } }
    }
  });
  if (!invoice) throw new ApiError(404, "Invoice not found");
  assertTenantBranchAccess(invoice, context);
  return invoice;
};

export const createInvoice = async (payload, actor, context) =>
  prisma.$transaction(async (tx) => {
    const tenantId = context.tenantId || payload.tenantId;
    const branchId = context.branchId || payload.branchId;
    if (!tenantId) throw new ApiError(400, "tenantId is required");
    if (!branchId) throw new ApiError(400, "branchId is required");

    ensureInvoiceAmounts(payload);
    await ensureBillingRules(tx, payload, { tenantId, branchId });

    const count = await tx.invoice.count({ where: { tenantId } });
    const nextInvoiceNo = invoiceNo(count);

    const invoice = await tx.invoice.create({
      data: {
        tenantId,
        branchId,
        invoiceNo: nextInvoiceNo,
        invoiceDate: payload.invoiceDate,
        patientId: payload.patientId,
        visitId: payload.visitId,
        creditCustomerId: payload.creditCustomerId || null,
        schemeId: payload.schemeId || null,
        billingType: payload.billingType,
        authorizationNo: payload.authorizationNo || null,
        grossAmount: round2(payload.grossAmount),
        discountAmount: round2(payload.discountAmount),
        netAmount: round2(payload.netAmount),
        patientCopayAmount: round2(payload.patientCopayAmount),
        creditAmount: round2(payload.creditAmount),
        amountPaid: 0,
        outstandingAmount: round2(payload.creditAmount),
        status: InvoiceStatus.DRAFT,
        notes: payload.notes || null,
        createdById: actor.userId,
        updatedById: actor.userId,
        items: {
          create: payload.items.map((item) => ({
            tenantId,
            branchId,
            servicePoint: item.servicePoint,
            itemCode: item.itemCode || null,
            description: item.description,
            quantity: round2(item.quantity),
            unitPrice: round2(item.unitPrice),
            discountAmount: round2(item.discountAmount || 0),
            netAmount: round2(item.netAmount),
            createdById: actor.userId,
            updatedById: actor.userId
          }))
        }
      },
      include: { items: true }
    });

    return invoice;
  });

export const updateInvoice = async (id, payload, actor, context) =>
  prisma.$transaction(async (tx) => {
    const invoice = await tx.invoice.findFirst({
      where: { id, deletedAt: null, ...(context.tenantId ? { tenantId: context.tenantId } : {}) },
      include: { items: { where: { deletedAt: null } } }
    });
    if (!invoice) throw new ApiError(404, "Invoice not found");
    if (![InvoiceStatus.DRAFT, InvoiceStatus.REVERSED].includes(invoice.status)) {
      throw new ApiError(400, "Only draft or reversed invoices can be edited");
    }
    assertTenantBranchAccess(invoice, context);

    const next = {
      grossAmount: payload.grossAmount ?? toNumber(invoice.grossAmount),
      discountAmount: payload.discountAmount ?? toNumber(invoice.discountAmount),
      netAmount: payload.netAmount ?? toNumber(invoice.netAmount),
      patientCopayAmount: payload.patientCopayAmount ?? toNumber(invoice.patientCopayAmount),
      creditAmount: payload.creditAmount ?? toNumber(invoice.creditAmount),
      items: invoice.items
    };
    ensureInvoiceAmounts(next);

    return tx.invoice.update({
      where: { id },
      data: {
        ...payload,
        updatedById: actor.userId,
        outstandingAmount: round2(next.creditAmount - toNumber(invoice.amountPaid))
      }
    });
  });

export const submitForApproval = async (id, comments, actor, context) =>
  prisma.$transaction(async (tx) => {
    const invoice = await tx.invoice.findFirst({
      where: { id, deletedAt: null, ...(context.tenantId ? { tenantId: context.tenantId } : {}) },
      include: { items: { where: { deletedAt: null } } }
    });
    if (!invoice) throw new ApiError(404, "Invoice not found");
    if (invoice.status !== InvoiceStatus.DRAFT && invoice.status !== InvoiceStatus.REVERSED) {
      throw new ApiError(400, "Only draft/reversed invoices can be submitted for approval");
    }
    ensureInvoiceAmounts({
      grossAmount: toNumber(invoice.grossAmount),
      discountAmount: toNumber(invoice.discountAmount),
      netAmount: toNumber(invoice.netAmount),
      patientCopayAmount: toNumber(invoice.patientCopayAmount),
      creditAmount: toNumber(invoice.creditAmount),
      items: invoice.items
    });
    const updated = await tx.invoice.update({
      where: { id },
      data: { status: InvoiceStatus.PENDING_APPROVAL, updatedById: actor.userId }
    });
    await createApprovalLog(tx, {
      tenantId: invoice.tenantId,
      branchId: invoice.branchId,
      invoiceId: invoice.id,
      action: ApprovalAction.SUBMITTED,
      comments: comments || null,
      actedById: actor.userId
    });
    return updated;
  });

export const approveInvoice = async (id, comments, actor, context) =>
  prisma.$transaction(async (tx) => {
    const invoice = await tx.invoice.findFirst({
      where: { id, deletedAt: null, ...(context.tenantId ? { tenantId: context.tenantId } : {}) }
    });
    if (!invoice) throw new ApiError(404, "Invoice not found");
    if (invoice.status !== InvoiceStatus.PENDING_APPROVAL) throw new ApiError(400, "Invoice is not pending approval");

    const updated = await tx.invoice.update({
      where: { id },
      data: {
        status: InvoiceStatus.APPROVED,
        approvedById: actor.userId,
        approvedAt: new Date(),
        updatedById: actor.userId
      }
    });
    await createApprovalLog(tx, {
      tenantId: invoice.tenantId,
      branchId: invoice.branchId,
      invoiceId: invoice.id,
      action: ApprovalAction.APPROVED,
      comments: comments || null,
      actedById: actor.userId
    });
    return updated;
  });

export const rejectInvoice = async (id, comments, actor, context) =>
  prisma.$transaction(async (tx) => {
    const invoice = await tx.invoice.findFirst({
      where: { id, deletedAt: null, ...(context.tenantId ? { tenantId: context.tenantId } : {}) }
    });
    if (!invoice) throw new ApiError(404, "Invoice not found");
    if (invoice.status !== InvoiceStatus.PENDING_APPROVAL) throw new ApiError(400, "Invoice is not pending approval");

    const updated = await tx.invoice.update({
      where: { id },
      data: { status: InvoiceStatus.REJECTED, updatedById: actor.userId }
    });
    await createApprovalLog(tx, {
      tenantId: invoice.tenantId,
      branchId: invoice.branchId,
      invoiceId: invoice.id,
      action: ApprovalAction.REJECTED,
      comments: comments || null,
      actedById: actor.userId
    });
    return updated;
  });

export const submitInvoiceToPayer = async (id, comments, actor, context) =>
  prisma.$transaction(async (tx) => {
    const invoice = await tx.invoice.findFirst({
      where: { id, deletedAt: null, ...(context.tenantId ? { tenantId: context.tenantId } : {}) }
    });
    if (!invoice) throw new ApiError(404, "Invoice not found");
    if (invoice.status !== InvoiceStatus.APPROVED) throw new ApiError(400, "Approval is required before submitting to payer");

    const updated = await tx.invoice.update({
      where: { id },
      data: {
        status: InvoiceStatus.SUBMITTED_TO_PAYER,
        submittedAt: new Date(),
        updatedById: actor.userId
      }
    });

    await createApprovalLog(tx, {
      tenantId: invoice.tenantId,
      branchId: invoice.branchId,
      invoiceId: invoice.id,
      action: ApprovalAction.SUBMITTED_TO_PAYER,
      comments: comments || null,
      actedById: actor.userId
    });
    return updated;
  });

export const generateClaimForInvoice = async (id, actor, context) =>
  prisma.$transaction(async (tx) => {
    const invoice = await tx.invoice.findFirst({
      where: { id, deletedAt: null, ...(context.tenantId ? { tenantId: context.tenantId } : {}) }
    });
    if (!invoice) throw new ApiError(404, "Invoice not found");
    if (![InvoiceStatus.APPROVED, InvoiceStatus.SUBMITTED_TO_PAYER, InvoiceStatus.PARTIALLY_PAID].includes(invoice.status)) {
      throw new ApiError(400, "Claim can only be generated for approved/submitted invoice");
    }
    const existingClaim = await tx.claim.findFirst({ where: { invoiceId: id, deletedAt: null } });
    if (existingClaim) return existingClaim;

    const claimCount = await tx.claim.count({ where: { tenantId: invoice.tenantId } });
    const created = await tx.claim.create({
      data: {
        tenantId: invoice.tenantId,
        branchId: invoice.branchId,
        claimNo: claimNo(claimCount),
        invoiceId: invoice.id,
        visitId: invoice.visitId,
        creditCustomerId: invoice.creditCustomerId,
        schemeId: invoice.schemeId,
        patientId: invoice.patientId,
        claimDate: new Date(),
        claimAmount: invoice.creditAmount,
        status: ClaimStatus.DRAFT,
        createdById: actor.userId,
        updatedById: actor.userId
      }
    });
    await createApprovalLog(tx, {
      tenantId: invoice.tenantId,
      branchId: invoice.branchId,
      invoiceId: invoice.id,
      action: ApprovalAction.CLAIM_GENERATED,
      actedById: actor.userId
    });
    return created;
  });

export const cancelInvoice = async (id, comments, actor, context) =>
  prisma.$transaction(async (tx) => {
    const invoice = await tx.invoice.findFirst({
      where: { id, deletedAt: null, ...(context.tenantId ? { tenantId: context.tenantId } : {}) }
    });
    if (!invoice) throw new ApiError(404, "Invoice not found");
    if (toNumber(invoice.amountPaid) > 0) throw new ApiError(400, "Cannot cancel an invoice with payments");
    if ([InvoiceStatus.CANCELLED, InvoiceStatus.REVERSED, InvoiceStatus.FULLY_PAID].includes(invoice.status)) {
      throw new ApiError(400, "Invoice cannot be cancelled from current status");
    }

    const updated = await tx.invoice.update({
      where: { id },
      data: {
        status: InvoiceStatus.CANCELLED,
        cancelledAt: new Date(),
        updatedById: actor.userId
      }
    });
    await createApprovalLog(tx, {
      tenantId: invoice.tenantId,
      branchId: invoice.branchId,
      invoiceId: invoice.id,
      action: ApprovalAction.CANCELLED,
      comments: comments || null,
      actedById: actor.userId
    });
    return updated;
  });

export const reverseInvoice = async (id, comments, actor, context) =>
  prisma.$transaction(async (tx) => {
    const invoice = await tx.invoice.findFirst({
      where: { id, deletedAt: null, ...(context.tenantId ? { tenantId: context.tenantId } : {}) }
    });
    if (!invoice) throw new ApiError(404, "Invoice not found");
    if (toNumber(invoice.amountPaid) > 0) throw new ApiError(400, "Cannot reverse invoice with allocations");
    if ([InvoiceStatus.CANCELLED, InvoiceStatus.REVERSED, InvoiceStatus.FULLY_PAID].includes(invoice.status)) {
      throw new ApiError(400, "Invoice cannot be reversed from current status");
    }

    const updated = await tx.invoice.update({
      where: { id },
      data: {
        status: InvoiceStatus.REVERSED,
        reversedAt: new Date(),
        updatedById: actor.userId
      }
    });
    await createApprovalLog(tx, {
      tenantId: invoice.tenantId,
      branchId: invoice.branchId,
      invoiceId: invoice.id,
      action: ApprovalAction.REVERSED,
      comments: comments || null,
      actedById: actor.userId
    });
    return updated;
  });

export const addInvoiceItem = async (invoiceId, payload, actor, context) =>
  prisma.$transaction(async (tx) => {
    const invoice = await tx.invoice.findFirst({
      where: { id: invoiceId, deletedAt: null, ...(context.tenantId ? { tenantId: context.tenantId } : {}) }
    });
    if (!invoice) throw new ApiError(404, "Invoice not found");
    if (![InvoiceStatus.DRAFT, InvoiceStatus.REVERSED].includes(invoice.status)) {
      throw new ApiError(400, "Invoice items cannot be edited after approval unless invoice is reversed");
    }
    const item = await tx.invoiceItem.create({
      data: {
        tenantId: invoice.tenantId,
        branchId: invoice.branchId,
        invoiceId,
        servicePoint: payload.servicePoint,
        itemCode: payload.itemCode || null,
        description: payload.description,
        quantity: round2(payload.quantity),
        unitPrice: round2(payload.unitPrice),
        discountAmount: round2(payload.discountAmount || 0),
        netAmount: round2(payload.netAmount),
        createdById: actor.userId,
        updatedById: actor.userId
      }
    });

    const allItems = await tx.invoiceItem.findMany({
      where: { invoiceId, deletedAt: null }
    });
    const newNet = round2(allItems.reduce((sum, entry) => sum + toNumber(entry.netAmount), 0));
    const newCreditAmount = round2(newNet - toNumber(invoice.patientCopayAmount));
    await tx.invoice.update({
      where: { id: invoiceId },
      data: {
        grossAmount: newNet + toNumber(invoice.discountAmount),
        netAmount: newNet,
        creditAmount: newCreditAmount,
        outstandingAmount: round2(newCreditAmount - toNumber(invoice.amountPaid)),
        updatedById: actor.userId
      }
    });

    return item;
  });

export const updateInvoiceItem = async (itemId, payload, actor, context) =>
  prisma.$transaction(async (tx) => {
    const item = await tx.invoiceItem.findFirst({
      where: { id: itemId, deletedAt: null, ...(context.tenantId ? { tenantId: context.tenantId } : {}) },
      include: { invoice: true }
    });
    if (!item) throw new ApiError(404, "Invoice item not found");
    if (![InvoiceStatus.DRAFT, InvoiceStatus.REVERSED].includes(item.invoice.status)) {
      throw new ApiError(400, "Invoice items cannot be edited after approval unless invoice is reversed");
    }

    const updated = await tx.invoiceItem.update({
      where: { id: itemId },
      data: {
        ...payload,
        quantity: payload.quantity != null ? round2(payload.quantity) : undefined,
        unitPrice: payload.unitPrice != null ? round2(payload.unitPrice) : undefined,
        discountAmount: payload.discountAmount != null ? round2(payload.discountAmount) : undefined,
        netAmount: payload.netAmount != null ? round2(payload.netAmount) : undefined,
        updatedById: actor.userId
      }
    });

    const allItems = await tx.invoiceItem.findMany({
      where: { invoiceId: item.invoiceId, deletedAt: null }
    });
    const newNet = round2(allItems.reduce((sum, entry) => sum + toNumber(entry.netAmount), 0));
    const newCreditAmount = round2(newNet - toNumber(item.invoice.patientCopayAmount));
    await tx.invoice.update({
      where: { id: item.invoiceId },
      data: {
        grossAmount: newNet + toNumber(item.invoice.discountAmount),
        netAmount: newNet,
        creditAmount: newCreditAmount,
        outstandingAmount: round2(newCreditAmount - toNumber(item.invoice.amountPaid)),
        updatedById: actor.userId
      }
    });
    return updated;
  });

export const deleteInvoiceItem = async (itemId, actor, context) =>
  prisma.$transaction(async (tx) => {
    const item = await tx.invoiceItem.findFirst({
      where: { id: itemId, deletedAt: null, ...(context.tenantId ? { tenantId: context.tenantId } : {}) },
      include: { invoice: true }
    });
    if (!item) throw new ApiError(404, "Invoice item not found");
    if (![InvoiceStatus.DRAFT, InvoiceStatus.REVERSED].includes(item.invoice.status)) {
      throw new ApiError(400, "Invoice items cannot be edited after approval unless invoice is reversed");
    }

    await tx.invoiceItem.update({
      where: { id: item.id },
      data: { deletedAt: new Date(), updatedById: actor.userId }
    });

    const allItems = await tx.invoiceItem.findMany({
      where: { invoiceId: item.invoiceId, deletedAt: null }
    });
    const newNet = round2(allItems.reduce((sum, entry) => sum + toNumber(entry.netAmount), 0));
    const newCreditAmount = round2(newNet - toNumber(item.invoice.patientCopayAmount));
    await tx.invoice.update({
      where: { id: item.invoiceId },
      data: {
        grossAmount: newNet + toNumber(item.invoice.discountAmount),
        netAmount: newNet,
        creditAmount: newCreditAmount,
        outstandingAmount: round2(newCreditAmount - toNumber(item.invoice.amountPaid)),
        updatedById: actor.userId
      }
    });
    return { deleted: true };
  });

export const listInvoiceReceipts = async (invoiceId, context) => {
  const invoice = await prisma.invoice.findFirst({
    where: { id: invoiceId, deletedAt: null, ...(context.tenantId ? { tenantId: context.tenantId } : {}) }
  });
  if (!invoice) throw new ApiError(404, "Invoice not found");
  return prisma.receipt.findMany({
    where: { invoiceId, deletedAt: null },
    orderBy: { createdAt: "desc" }
  });
};

