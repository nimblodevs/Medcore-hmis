import * as promiseService from "../services/promise-to-pay.service.js";
import { promiseRepository } from "../repositories/promise.repository.js";

export const getPromisesByCase = async (req, res, next) => {
  try {
    const { caseId } = req.params;
    const { tenantId, branchId } = req.auth;

    const promises = await promiseRepository.findByCaseId(caseId);

    // Verify tenant/branch access
    if (promises.length > 0 && promises[0].case) {
      const caseItem = promises[0].case;
      if (caseItem.tenantId !== tenantId || caseItem.branchId !== branchId) {
        return res.status(403).json({
          success: false,
          message: "Unauthorized access to promises",
        });
      }
    }

    res.json({
      success: true,
      message: "Promises retrieved successfully",
      data: promises,
    });
  } catch (error) {
    next(error);
  }
};

export const createPromise = async (req, res, next) => {
  try {
    const { caseId } = req.params;
    const { tenantId, branchId, userId } = req.auth;
    const { promisedAmount, promisedDate, notes } = req.body;

    // Validation
    if (!promisedAmount || promisedAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Promised amount must be greater than zero",
      });
    }

    if (!promisedDate) {
      return res.status(400).json({
        success: false,
        message: "Promised date is required",
      });
    }

    const newPromise = await promiseService.createPromise({
      caseId,
      tenantId,
      branchId,
      promisedAmount,
      promisedDate,
      notes,
      createdById: userId,
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    res.status(201).json({
      success: true,
      message: "Promise to pay created successfully",
      data: newPromise,
    });
  } catch (error) {
    if (error.message.includes("not found")) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

export const updatePromise = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { tenantId, branchId, userId } = req.auth;
    const { promisedAmount, promisedDate, notes } = req.body;

    const updateData = {};
    if (promisedAmount !== undefined) updateData.promisedAmount = promisedAmount;
    if (promisedDate !== undefined) updateData.promisedDate = promisedDate;
    if (notes !== undefined) updateData.notes = notes;

    const updatedPromise = await promiseService.updatePromise({
      promiseId: id,
      tenantId,
      branchId,
      updateData,
      updatedById: userId,
      reason: req.body.reason,
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    res.json({
      success: true,
      message: "Promise updated successfully",
      data: updatedPromise,
    });
  } catch (error) {
    if (error.message.includes("not found")) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

export const markPromiseFulfilled = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { tenantId, branchId, userId } = req.auth;
    const { fulfilledAmount } = req.body;

    const updatedPromise = await promiseService.markFulfilled({
      promiseId: id,
      tenantId,
      branchId,
      fulfilledAmount,
      fulfilledById: userId,
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    res.json({
      success: true,
      message: "Promise marked as fulfilled successfully",
      data: updatedPromise,
    });
  } catch (error) {
    if (error.message.includes("not found")) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

export const getOverduePromises = async (req, res, next) => {
  try {
    const { tenantId, branchId } = req.auth;
    const { caseId, collectorId } = req.query;

    const promises = await promiseRepository.findOverdue({
      tenantId,
      branchId,
      caseId,
      collectorId,
    });

    res.json({
      success: true,
      message: "Overdue promises retrieved successfully",
      data: promises,
    });
  } catch (error) {
    next(error);
  }
};
