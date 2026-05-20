import asyncHandler from "../utils/asyncHandler.js";
import { ok } from "../utils/apiResponse.js";
import * as referenceService from "../services/reference.service.js";

export const nextReference = asyncHandler(async (req, res) => {
  const data = await referenceService.getNextReference(req.body);
  ok(res, data, "Reference generated");
});

