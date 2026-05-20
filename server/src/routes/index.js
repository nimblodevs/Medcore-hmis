import { Router } from "express";
import authRoutes from "./auth.routes.js";
import referenceRoutes from "./reference.routes.js";
import tenantRoutes from "./tenant.routes.js";
import branchRoutes from "./branch.routes.js";
import userRoutes from "./user.routes.js";
import roleRoutes from "./role.routes.js";
import departmentRoutes from "./department.routes.js";
import invoiceRoutes from "./invoice.routes.js";
import invoiceItemRoutes from "./invoice-item.routes.js";
import paymentRoutes from "./payment.routes.js";
import receiptRoutes from "./receipt.routes.js";
import reportRoutes from "./report.routes.js";
import authenticateUser from "../middlewares/authenticateUser.js";
import tenantScope from "../middlewares/tenantScope.js";
import branchScope from "../middlewares/branchScope.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/references", referenceRoutes);

router.use(authenticateUser, tenantScope, branchScope);
router.use("/tenants", tenantRoutes);
router.use("/branches", branchRoutes);
router.use("/users", userRoutes);
router.use("/roles", roleRoutes);
router.use("/departments", departmentRoutes);
router.use("/invoices", invoiceRoutes);
router.use("/invoice-items", invoiceItemRoutes);
router.use("/payments", paymentRoutes);
router.use("/receipts", receiptRoutes);
router.use("/reports", reportRoutes);

export default router;
