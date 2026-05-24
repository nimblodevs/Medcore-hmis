import * as disputeService from "../services/credit-dispute.service.js";
import { disputeRepository } from "../repositories/dispute.repository.js";

export const getDisputes = async (req, res, next) => {
  try {
    const { tenantId, branchId } = req.auth;
    const { status, creditAccountId, caseId, invoiceId } = req.query;

    const disputes = await disputeRepository.findByFilters({
      tenantId,
      branchId,
      status,
      creditAccountId,
      caseId,
      invoiceId,
    });

    res.json({
      success: true,
      message: "Credit disputes retrieved successfully",
      data: disputes,
    });
  } catch (error) {
    next(error);
  }
};

export const createDispute = async (req, res, next) => {
  try {
    const { caseId } = req.params;
    const { tenantId, branchId, userId } = req.auth;
    const { creditAccountId, invoiceId, disputeReason, disputedAmount } = req.body;

    // Validation
    if (!creditAccountId) {
      return res.status(400).json({
        success: false,
        message: "Credit account ID is required",
      });
    }

    if (!disputeReason) {
      return res.status(400).json({
        success: false,
        message: "Dispute reason is required",
      });
    }

    const newDispute = await disputeService.createDispute({
      caseId,
      tenantId,
      branchId,
      creditAccountId,
      invoiceId,
      disputeReason,
      disputedAmount,
      openedById: userId,
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    res.status(201).json({
      success: true,
      message: "Credit dispute created successfully",
      data: newDispute,
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

export const resolveDispute = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { tenantId, branchId, userId } = req.auth;
    const { status, resolutionNotes } = req.body;

    // Validation
    if (!status || !["ACCEPTED", "REJECTED", "RESOLVED"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Valid resolution status is required (ACCEPTED, REJECTED, or RESOLVED)",
      });
    }

    if (!resolutionNotes) {
      return res.status(400).json({
        success: false,
        message: "Resolution notes are required",
      });
    }

    const updatedDispute = await disputeService.resolveDispute({
      disputeId: id,
      tenantId,
      branchId,
      status,
      resolutionNotes,
      resolvedById: userId,
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    res.json({
      success: true,
      message: "Credit dispute resolved successfully",
      data: updatedDispute,
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

export const cancelDispute = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { tenantId, branchId, userId } = req.auth;
    const { cancellationReason } = req.body;

    if (!cancellationReason) {
      return res.status(400).json({
        success: false,
        message: "Cancellation reason is required",
      });
    }

    const updatedDispute = await disputeService.cancelDispute({
      disputeId: id,
      tenantId,
      branchId,
      cancellationReason,
      cancelledById: userId,
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    res.json({
      success: true,
      message: "Credit dispute cancelled successfully",
      data: updatedDispute,
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
