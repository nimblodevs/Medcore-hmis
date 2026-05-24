import { caseRepository } from "../repositories/case.repository.js";
import * as caseService from "../services/credit-control-case.service.js";

export const getCases = async (req, res, next) => {
  try {
    const { tenantId, branchId } = req.auth;
    const { status, riskLevel, agingBucket, assignedCollectorId, creditAccountId, page = 1, limit = 20 } = req.query;

    const result = await caseRepository.findByFilters({
      tenantId,
      branchId,
      status,
      riskLevel,
      agingBucket,
      assignedCollectorId,
      creditAccountId,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
    });

    res.json({
      success: true,
      message: "Cases retrieved successfully",
      data: result.cases,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getCaseById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { tenantId, branchId } = req.auth;

    const caseItem = await caseRepository.findById(id);

    if (!caseItem) {
      return res.status(404).json({
        success: false,
        message: "Credit control case not found",
      });
    }

    if (caseItem.tenantId !== tenantId || caseItem.branchId !== branchId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access to case",
      });
    }

    res.json({
      success: true,
      message: "Case retrieved successfully",
      data: caseItem,
    });
  } catch (error) {
    next(error);
  }
};

export const createCase = async (req, res, next) => {
  try {
    const { tenantId, branchId, userId } = req.auth;
    const {
      creditAccountId,
      primaryInvoiceId,
      outstandingAmount,
      overdueAmount,
      invoiceDueDate,
      creditLimit,
      summary,
      notes,
    } = req.body;

    // Validation
    if (!creditAccountId) {
      return res.status(400).json({
        success: false,
        message: "Credit account ID is required",
      });
    }

    if (!outstandingAmount || outstandingAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Outstanding amount must be greater than zero",
      });
    }

    const newCase = await caseService.createCase({
      tenantId,
      branchId,
      creditAccountId,
      primaryInvoiceId,
      outstandingAmount,
      overdueAmount,
      invoiceDueDate,
      creditLimit,
      summary,
      notes,
      createdById: userId,
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    res.status(201).json({
      success: true,
      message: "Credit control case created successfully",
      data: newCase,
    });
  } catch (error) {
    if (error.message.includes("already exists")) {
      return res.status(409).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

export const updateCase = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { tenantId, branchId, userId } = req.auth;
    const { summary, notes, status, riskLevel } = req.body;

    const updateData = {};
    if (summary !== undefined) updateData.summary = summary;
    if (notes !== undefined) updateData.notes = notes;
    if (status !== undefined) updateData.status = status;
    if (riskLevel !== undefined) updateData.riskLevel = riskLevel;

    const updatedCase = await caseService.updateCase({
      caseId: id,
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
      message: "Case updated successfully",
      data: updatedCase,
    });
  } catch (error) {
    next(error);
  }
};

export const assignCollector = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { tenantId, branchId, userId } = req.auth;
    const { collectorId } = req.body;

    if (!collectorId) {
      return res.status(400).json({
        success: false,
        message: "Collector ID is required",
      });
    }

    const updatedCase = await caseService.assignCollector({
      caseId: id,
      tenantId,
      branchId,
      collectorId,
      assignedById: userId,
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    res.json({
      success: true,
      message: "Collector assigned successfully",
      data: updatedCase,
    });
  } catch (error) {
    next(error);
  }
};

export const closeCase = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { tenantId, branchId, userId } = req.auth;
    const { closureReason } = req.body;

    if (!closureReason) {
      return res.status(400).json({
        success: false,
        message: "Closure reason is required",
      });
    }

    const updatedCase = await caseService.closeCase({
      caseId: id,
      tenantId,
      branchId,
      closureReason,
      closedById: userId,
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    res.json({
      success: true,
      message: "Case closed successfully",
      data: updatedCase,
    });
  } catch (error) {
    next(error);
  }
};

export const reopenCase = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { tenantId, branchId, userId } = req.auth;

    const updatedCase = await caseService.reopenCase({
      caseId: id,
      tenantId,
      branchId,
      reopenedById: userId,
    });

    res.json({
      success: true,
      message: "Case reopened successfully",
      data: updatedCase,
    });
  } catch (error) {
    next(error);
  }
};
