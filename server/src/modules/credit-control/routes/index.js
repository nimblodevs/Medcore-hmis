import { Router } from "express";
import casesRoutes from "./cases.routes.js";
import followUpsRoutes from "./followUps.routes.js";
import promisesRoutes from "./promises.routes.js";
import holdsRoutes from "./holds.routes.js";
import disputesRoutes from "./disputes.routes.js";
import writeOffsRoutes from "./writeOffs.routes.js";
import reportsRoutes from "./reports.routes.js";

const router = Router();

// Mount all credit control routes
router.use("/", casesRoutes);
router.use("/", followUpsRoutes);
router.use("/", promisesRoutes);
router.use("/", holdsRoutes);
router.use("/", disputesRoutes);
router.use("/", writeOffsRoutes);
router.use("/", reportsRoutes);

export default router;
