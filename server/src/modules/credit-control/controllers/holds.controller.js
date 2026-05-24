import * as holdService from "../services/credit-hold.service.js";
import { holdRepository } from "../repositories/hold.repository.js";

export const getHolds = async (req, res, next) => {
  try {
    const { tenantId, branchId } = req.auth;
    const { status, creditAccountId, caseId } = req.query;

    const holds = await holdRepository.findByFilters({
      tenantId,
      branchId,
      status,
      creditAccountId,
      caseId,
    });

    res.json({
      success: true,
      message: "Credit holds retrieved successfully",
      data: holds,
    });
  } catch (error) {
    next(error);
  }
};

export const recommendHold = async (req, res, next) => {
  try {
    const { caseId } = req.params;
    const { tenantId, branchId, userId } = req.auth;
    const { reason, creditAccountId } = req.body;

    // Validation
    if (!reason) {
      return res.status(400).json({
        success: false,
        message: "Reason is required for credit hold recommendation",
      });
    }

    if (!creditAccountId) {
      return res.status(400).json({
        success: false,
        message: "Credit account ID is required",
      });
    }

    const newHold = await holdService.recommendHold({
      caseId,
      tenantId,
      branchId,
      creditAccountId,
      reason,
      recommendedById: userId,
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    res.status(201).json({
      success: true,
      message: "Credit hold recommended successfully",
      data: newHold,
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

export const approveHold = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { tenantId, branchId, userId } = req.auth;

    const updatedHold = await holdService.approveHold({
      holdId: id,
      tenantId,
      branchId,
      approvedById: userId,
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    res.json({
      success: true,
      message: "Credit hold approved successfully",
      data: updatedHold,
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

export const rejectHold = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { tenantId, branchId, userId } = req.auth;
    const { rejectionReason } = req.body;

    if (!rejectionReason) {
      return res.status(400).json({
        success: false,
        message: "Rejection reason is required",
      });
    }

    const updatedHold = await holdService.rejectHold({
      holdId: id,
      tenantId,
      branchId,
      rejectionReason,
      rejectedById: userId,
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    res.json({
      success: true,
      message: "Credit hold rejected successfully",
      data: updatedHold,
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

export const releaseHold = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { tenantId, branchId, userId } = req.auth;
    const { releaseReason } = req.body;

    if (!releaseReason) {
      return res.status(400).json({
        success: false,
        message: "Release reason is required",
      });
    }

    const updatedHold = await holdService.releaseHold({
      holdId: id,
      tenantId,
      branchId,
      releaseReason,
      releasedById: userId,
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    res.json({
      success: true,
      message: "Credit hold released successfully",
      data: updatedHold,
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
