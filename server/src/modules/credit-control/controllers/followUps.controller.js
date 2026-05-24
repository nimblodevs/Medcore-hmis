import * as followUpService from "../services/follow-up.service.js";
import { followUpRepository } from "../repositories/followUp.repository.js";

export const getFollowUpsByCase = async (req, res, next) => {
  try {
    const { caseId } = req.params;
    const { tenantId, branchId } = req.auth;

    const followUps = await followUpRepository.findByCaseId(caseId);

    // Verify tenant/branch access
    if (followUps.length > 0 && followUps[0].case) {
      const caseItem = followUps[0].case;
      if (caseItem.tenantId !== tenantId || caseItem.branchId !== branchId) {
        return res.status(403).json({
          success: false,
          message: "Unauthorized access to follow-ups",
        });
      }
    }

    res.json({
      success: true,
      message: "Follow-ups retrieved successfully",
      data: followUps,
    });
  } catch (error) {
    next(error);
  }
};

export const recordFollowUp = async (req, res, next) => {
  try {
    const { caseId } = req.params;
    const { tenantId, branchId, userId } = req.auth;
    const {
      actionType,
      outcome,
      contactPerson,
      contactPhone,
      contactEmail,
      notes,
      nextFollowUpAt,
    } = req.body;

    // Validation
    if (!actionType) {
      return res.status(400).json({
        success: false,
        message: "Action type is required",
      });
    }

    if (!outcome) {
      return res.status(400).json({
        success: false,
        message: "Outcome is required",
      });
    }

    if (!notes) {
      return res.status(400).json({
        success: false,
        message: "Notes are required",
      });
    }

    const newFollowUp = await followUpService.recordFollowUp({
      caseId,
      tenantId,
      branchId,
      actionType,
      outcome,
      contactPerson,
      contactPhone,
      contactEmail,
      notes,
      nextFollowUpAt,
      recordedById: userId,
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    res.status(201).json({
      success: true,
      message: "Follow-up recorded successfully",
      data: newFollowUp,
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

export const getFollowUpsDueToday = async (req, res, next) => {
  try {
    const { tenantId, branchId } = req.auth;
    const { collectorId } = req.query;

    const followUps = await followUpRepository.findDueToday({
      tenantId,
      branchId,
      collectorId,
    });

    res.json({
      success: true,
      message: "Follow-ups due today retrieved successfully",
      data: followUps,
    });
  } catch (error) {
    next(error);
  }
};

export const getOverdueFollowUps = async (req, res, next) => {
  try {
    const { tenantId, branchId } = req.auth;
    const { collectorId } = req.query;

    const followUps = await followUpRepository.findOverdue({
      tenantId,
      branchId,
      collectorId,
    });

    res.json({
      success: true,
      message: "Overdue follow-ups retrieved successfully",
      data: followUps,
    });
  } catch (error) {
    next(error);
  }
};
