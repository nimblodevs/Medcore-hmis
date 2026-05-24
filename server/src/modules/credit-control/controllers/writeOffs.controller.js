import * as writeOffService from "../services/write-off-recommendation.service.js";
import { writeOffRepository } from "../repositories/writeOff.repository.js";

export const getWriteOffs = async (req, res, next) => {
  try {
    const { tenantId, branchId } = req.auth;
    const { status, creditAccountId, caseId, invoiceId } = req.query;

    const writeOffs = await writeOffRepository.findByFilters({
      tenantId,
      branchId,
      status,
      creditAccountId,
      caseId,
      invoiceId,
    });

    res.json({
      success: true,
      message: "Write-off recommendations retrieved successfully",
      data: writeOffs,
    });
  } catch (error) {
    next(error);
  }
};

export const recommendWriteOff = async (req, res, next) => {
  try {
    const { caseId } = req.params;
    const { tenantId, branchId, userId } = req.auth;
    const { creditAccountId, invoiceId, amount, reason } = req.body;

    // Validation
    if (!creditAccountId) {
      return res.status(400).json({
        success: false,
        message: "Credit account ID is required",
      });
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Amount must be greater than zero",
      });
    }

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: "Reason is required for write-off recommendation",
      });
    }

    const newWriteOff = await writeOffService.recommendWriteOff({
      caseId,
      tenantId,
      branchId,
      creditAccountId,
      invoiceId,
      amount,
      reason,
      recommendedById: userId,
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    res.status(201).json({
      success: true,
      message: "Write-off recommendation created successfully",
      data: newWriteOff,
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

export const approveWriteOff = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { tenantId, branchId, userId } = req.auth;

    const updatedWriteOff = await writeOffService.approveWriteOff({
      writeOffId: id,
      tenantId,
      branchId,
      approvedById: userId,
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    res.json({
      success: true,
      message: "Write-off recommendation approved successfully",
      data: updatedWriteOff,
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

export const rejectWriteOff = async (req, res, next) => {
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

    const updatedWriteOff = await writeOffService.rejectWriteOff({
      writeOffId: id,
      tenantId,
      branchId,
      rejectionReason,
      rejectedById: userId,
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    res.json({
      success: true,
      message: "Write-off recommendation rejected successfully",
      data: updatedWriteOff,
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

export const postWriteOff = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { tenantId, branchId, userId } = req.auth;
    const { adjustmentId } = req.body;

    if (!adjustmentId) {
      return res.status(400).json({
        success: false,
        message: "Adjustment ID is required to post write-off",
      });
    }

    const updatedWriteOff = await writeOffService.postWriteOff({
      writeOffId: id,
      tenantId,
      branchId,
      adjustmentId,
      postedById: userId,
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    res.json({
      success: true,
      message: "Write-off posted successfully",
      data: updatedWriteOff,
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
