import { Router } from "express";
import * as promisesController from "../controllers/promises.controller.js";

const router = Router();

// GET /api/credit-control/cases/:caseId/promises - List promises for a case
router.get("/cases/:caseId/promises", promisesController.getPromisesByCase);

// POST /api/credit-control/cases/:caseId/promises - Create new promise
router.post("/cases/:caseId/promises", promisesController.createPromise);

// PATCH /api/credit-control/promises/:id - Update promise
router.patch("/promises/:id", promisesController.updatePromise);

// POST /api/credit-control/promises/:id/mark-fulfilled - Mark promise as fulfilled
router.post("/promises/:id/mark-fulfilled", promisesController.markPromiseFulfilled);

// GET /api/credit-control/promises/overdue - Get overdue promises
router.get("/promises/overdue", promisesController.getOverduePromises);

export default router;
