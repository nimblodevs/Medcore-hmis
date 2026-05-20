import { Router } from "express";
import * as referenceController from "../controllers/reference.controller.js";
import validateRequest from "../middlewares/validateRequest.js";
import { nextReferenceSchema } from "../validators/reference.validator.js";

const router = Router();

router.post("/next", validateRequest(nextReferenceSchema), referenceController.nextReference);

export default router;

