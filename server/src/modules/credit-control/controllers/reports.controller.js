import * as reportService from "../services/credit-control-report.service.js";

export const getDashboard = async (req, res, next) => {
  try {
    const { tenantId, branchId } = req.auth;

    const dashboard = await reportService.getDashboardStats({
      tenantId,
      branchId,
    });

    res.json({
      success: true,
      message: "Dashboard statistics retrieved successfully",
      data: dashboard,
    });
  } catch (error) {
    next(error);
  }
};

export const getAgingReport = async (req, res, next) => {
  try {
    const { tenantId, branchId } = req.auth;
    const { creditAccountId, agingBucket } = req.query;

    const report = await reportService.getAgingReport({
      tenantId,
      branchId,
      creditAccountId,
      agingBucket,
    });

    res.json({
      success: true,
      message: "Aging report retrieved successfully",
      data: report,
    });
  } catch (error) {
    next(error);
  }
};

export const getCollectorWorkload = async (req, res, next) => {
  try {
    const { tenantId, branchId } = req.auth;
    const { collectorId } = req.query;

    const report = await reportService.getCollectorWorkload({
      tenantId,
      branchId,
      collectorId,
    });

    res.json({
      success: true,
      message: "Collector workload report retrieved successfully",
      data: report,
    });
  } catch (error) {
    next(error);
  }
};

export const getPromisesReport = async (req, res, next) => {
  try {
    const { tenantId, branchId } = req.auth;
    const { status, dateFrom, dateTo } = req.query;

    const report = await reportService.getPromisesReport({
      tenantId,
      branchId,
      status,
      dateFrom,
      dateTo,
    });

    res.json({
      success: true,
      message: "Promises report retrieved successfully",
      data: report,
    });
  } catch (error) {
    next(error);
  }
};

export const getHoldsReport = async (req, res, next) => {
  try {
    const { tenantId, branchId } = req.auth;
    const { status } = req.query;

    const report = await reportService.getHoldsReport({
      tenantId,
      branchId,
      status,
    });

    res.json({
      success: true,
      message: "Credit holds report retrieved successfully",
      data: report,
    });
  } catch (error) {
    next(error);
  }
};

export const getDisputesReport = async (req, res, next) => {
  try {
    const { tenantId, branchId } = req.auth;
    const { status } = req.query;

    const report = await reportService.getDisputesReport({
      tenantId,
      branchId,
      status,
    });

    res.json({
      success: true,
      message: "Disputes report retrieved successfully",
      data: report,
    });
  } catch (error) {
    next(error);
  }
};

export const getWriteOffsReport = async (req, res, next) => {
  try {
    const { tenantId, branchId } = req.auth;
    const { status, dateFrom, dateTo } = req.query;

    const report = await reportService.getWriteOffsReport({
      tenantId,
      branchId,
      status,
      dateFrom,
      dateTo,
    });

    res.json({
      success: true,
      message: "Write-offs report retrieved successfully",
      data: report,
    });
  } catch (error) {
    next(error);
  }
};

export const getOverdueAccountsReport = async (req, res, next) => {
  try {
    const { tenantId, branchId } = req.auth;
    const { agingBucket, riskLevel, limit } = req.query;

    const report = await reportService.getOverdueAccountsReport({
      tenantId,
      branchId,
      agingBucket,
      riskLevel,
      limit: limit ? parseInt(limit, 10) : undefined,
    });

    res.json({
      success: true,
      message: "Overdue accounts report retrieved successfully",
      data: report,
    });
  } catch (error) {
    next(error);
  }
};
