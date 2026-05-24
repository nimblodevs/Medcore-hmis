import { Router } from "express";
import debtorSchemeRoutes from "./debtor-scheme.routes.js";

const router = Router();

// Mount debtor scheme routes at /schemes
router.use("/schemes", debtorSchemeRoutes);

// Future: Mount other scheme-related routes
// router.use("/department-rules", departmentRuleRoutes);
// router.use("/service-point-rules", servicePointRuleRoutes);
// router.use("/outpatient-limits", outpatientLimitRoutes);
// router.use("/visit-limits", visitLimitRoutes);
// router.use("/copayment-categories", copaymentCategoryRoutes);
// router.use("/copayment-rules", copaymentRuleRoutes);
// router.use("/authorization-rules", authorizationRuleRoutes);
// router.use("/eligibility", eligibilityRoutes);

export default router;
