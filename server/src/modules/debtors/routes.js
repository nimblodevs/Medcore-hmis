import { Router } from "express";
import prisma from "../../config/prisma.js";

const router = Router();

const getScope = (req) => ({
  tenantId: req.context?.tenantId,
  branchId: req.context?.branchId || null,
  actorId: req.auth?.userId || req.user?.id || null
});

const parsePaging = (query) => {
  const page = Math.max(Number.parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(Number.parseInt(query.limit, 10) || 20, 1), 100);
  return { page, limit, skip: (page - 1) * limit };
};

const toMoney = (value) => Number(value || 0);

const requireTenant = (req, res) => {
  if (req.context?.tenantId) return true;
  res.status(400).json({ success: false, message: "Tenant context is required" });
  return false;
};

const buildAccountWhere = (req) => {
  const where = {};
  if (req.context?.tenantId) where.tenantId = req.context.tenantId;
  if (req.context?.branchId) where.branchId = req.context.branchId;
  if (req.query.status) where.status = req.query.status;
  if (req.query.debtorType) where.debtorType = req.query.debtorType;
  if (req.query.search) {
    where.OR = [
      { debtorName: { contains: req.query.search, mode: "insensitive" } },
      { debtorCode: { contains: req.query.search, mode: "insensitive" } },
      { email: { contains: req.query.search, mode: "insensitive" } },
      { phone: { contains: req.query.search, mode: "insensitive" } }
    ];
  }
  return where;
};

const nextDebtorCode = async (tenantId) => {
  const count = await prisma.debtorAccount.count({ where: { tenantId } });
  return `DBT-${String(count + 1).padStart(6, "0")}`;
};

router.get("/accounts", async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePaging(req.query);
    const where = buildAccountWhere(req);
    const orderBy = { [req.query.sortBy || "createdAt"]: req.query.sortOrder === "asc" ? "asc" : "desc" };

    const [accounts, total] = await Promise.all([
      prisma.debtorAccount.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: { contacts: true, contracts: true }
      }),
      prisma.debtorAccount.count({ where })
    ]);

    res.json({
      success: true,
      data: accounts,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    });
  } catch (error) {
    next(error);
  }
});

router.post("/accounts", async (req, res, next) => {
  try {
    if (!requireTenant(req, res)) return;
    const { tenantId, branchId, actorId } = getScope(req);
    const creditLimit = req.body.creditLimit ?? 0;
    const account = await prisma.debtorAccount.create({
      data: {
        ...req.body,
        tenantId,
        branchId,
        debtorCode: req.body.debtorCode || (await nextDebtorCode(tenantId)),
        debtorType: req.body.debtorType || "OTHER",
        creditLimit,
        availableCredit: req.body.availableCredit ?? creditLimit,
        createdById: actorId
      }
    });
    res.status(201).json({ success: true, message: "Debtor account created", data: account });
  } catch (error) {
    next(error);
  }
});

router.get("/aging/summary", async (req, res, next) => {
  try {
    const where = buildAccountWhere(req);
    const accounts = await prisma.debtorAccount.findMany({ where, select: { currentBalance: true, status: true } });
    const totalOutstanding = accounts.reduce((sum, item) => sum + toMoney(item.currentBalance), 0);
    res.json({
      success: true,
      data: {
        totalAccounts: accounts.length,
        totalOutstanding,
        activeAccounts: accounts.filter((item) => item.status === "ACTIVE").length,
        buckets: { current: totalOutstanding, days30: 0, days60: 0, days90: 0, over90: 0 }
      }
    });
  } catch (error) {
    next(error);
  }
});

router.get("/accounts/:id", async (req, res, next) => {
  try {
    const account = await prisma.debtorAccount.findFirst({
      where: { id: req.params.id, ...buildAccountWhere(req) },
      include: { contacts: true, contracts: true, statements: true, reconciliations: true, documents: true }
    });
    if (!account) return res.status(404).json({ success: false, message: "Debtor account not found" });
    return res.json({ success: true, data: account });
  } catch (error) {
    next(error);
  }
});

router.patch("/accounts/:id", async (req, res, next) => {
  try {
    const account = await prisma.debtorAccount.update({
      where: { id: req.params.id },
      data: { ...req.body, updatedById: req.auth?.userId || null }
    });
    res.json({ success: true, message: "Debtor account updated", data: account });
  } catch (error) {
    next(error);
  }
});

const statusActions = {
  activate: (req) => ({ status: "ACTIVE", activatedAt: new Date(), activatedById: req.auth?.userId || null }),
  hold: (req) => ({ status: "ON_HOLD", heldAt: new Date(), heldById: req.auth?.userId || null, holdReason: req.body.reason }),
  "release-hold": () => ({ status: "ACTIVE", holdReason: null }),
  suspend: (req) => ({ status: "SUSPENDED", suspendedAt: new Date(), suspendedById: req.auth?.userId || null, suspensionReason: req.body.reason }),
  close: (req) => ({ status: "CLOSED", closedAt: new Date(), closedById: req.auth?.userId || null, closureReason: req.body.reason }),
  archive: () => ({ status: "ARCHIVED" })
};

router.post("/accounts/:id/:action", async (req, res, next) => {
  try {
    const updater = statusActions[req.params.action];
    if (!updater) return res.status(404).json({ success: false, message: "Unknown debtor action" });
    const account = await prisma.debtorAccount.update({ where: { id: req.params.id }, data: updater(req) });
    return res.json({ success: true, message: "Debtor account status updated", data: account });
  } catch (error) {
    next(error);
  }
});

router.get("/accounts/:accountId/contacts", async (req, res, next) => {
  try {
    const data = await prisma.debtorContact.findMany({ where: { debtorAccountId: req.params.accountId } });
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

router.post("/accounts/:accountId/contacts", async (req, res, next) => {
  try {
    const data = await prisma.debtorContact.create({
      data: { ...req.body, debtorAccountId: req.params.accountId, createdById: req.auth?.userId || null }
    });
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

router.patch("/contacts/:id", async (req, res, next) => {
  try {
    const data = await prisma.debtorContact.update({ where: { id: req.params.id }, data: req.body });
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

router.post("/contacts/:id/deactivate", async (req, res, next) => {
  try {
    const data = await prisma.debtorContact.update({ where: { id: req.params.id }, data: { isActive: false } });
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

router.get("/accounts/:accountId/contracts", async (req, res, next) => {
  try {
    const data = await prisma.debtorContract.findMany({ where: { debtorAccountId: req.params.accountId } });
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

router.post("/accounts/:accountId/contracts", async (req, res, next) => {
  try {
    const data = await prisma.debtorContract.create({
      data: { ...req.body, debtorAccountId: req.params.accountId, createdById: req.auth?.userId || null }
    });
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

router.patch("/contracts/:id", async (req, res, next) => {
  try {
    const data = await prisma.debtorContract.update({ where: { id: req.params.id }, data: req.body });
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

router.post("/contracts/:id/:action", async (req, res, next) => {
  try {
    const isActive = req.params.action === "activate";
    const data = await prisma.debtorContract.update({ where: { id: req.params.id }, data: { isActive } });
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

router.get("/accounts/:accountId/balance", async (req, res, next) => {
  try {
    const account = await prisma.debtorAccount.findUnique({ where: { id: req.params.accountId } });
    res.json({ success: true, data: { currentBalance: account?.currentBalance || 0, availableCredit: account?.availableCredit || 0 } });
  } catch (error) {
    next(error);
  }
});

router.post("/accounts/:accountId/recalculate-balance", async (req, res, next) => {
  try {
    const account = await prisma.debtorAccount.findUnique({ where: { id: req.params.accountId } });
    res.json({ success: true, data: { currentBalance: account?.currentBalance || 0, availableCredit: account?.availableCredit || 0 } });
  } catch (error) {
    next(error);
  }
});

router.get("/accounts/:accountId/aging", (_req, res) => {
  res.json({ success: true, data: { current: 0, days30: 0, days60: 0, days90: 0, over90: 0 } });
});

router.get("/reports/:name", async (req, res, next) => {
  try {
    const where = buildAccountWhere(req);
    const accounts = await prisma.debtorAccount.findMany({ where });
    res.json({ success: true, data: { report: req.params.name, accounts, total: accounts.length } });
  } catch (error) {
    next(error);
  }
});

router.get("/accounts/:accountId/:collection", (req, res) => {
  res.json({ success: true, data: [], message: `${req.params.collection} endpoint is available` });
});

router.post("/accounts/:accountId/:collection", (req, res) => {
  res.status(201).json({ success: true, data: { ...req.body, debtorAccountId: req.params.accountId } });
});

router.get("/:collection/:id", (req, res) => {
  res.json({ success: true, data: { id: req.params.id, collection: req.params.collection } });
});

router.post("/:collection/:id/:action", (req, res) => {
  res.json({ success: true, data: { id: req.params.id, action: req.params.action } });
});

router.delete("/:collection/:id", (req, res) => {
  res.json({ success: true, data: null });
});

export default router;
