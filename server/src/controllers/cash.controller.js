import { CashCounterService } from "../services/cashCounter.service.js";
import { CashierProfileService } from "../services/cashierProfile.service.js";
import { CashSessionService } from "../services/cashSession.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import {
  createCashCounterSchema,
  updateCashCounterSchema,
  createCashierProfileSchema,
  updateCashierProfileSchema,
  openCashSessionSchema,
  closeCashSessionSchema,
  recordCashPaymentSchema,
  requestRefundSchema,
  approveRefundSchema,
  rejectRefundSchema,
  submitHandoverSchema,
  reviewHandoverSchema
} from "../validators/cash.validator.js";

const cashCounterService = new CashCounterService();
const cashierProfileService = new CashierProfileService();
const cashSessionService = new CashSessionService();

// ==================== Cash Counter Controllers ====================

export const getCashCounters = asyncHandler(async (req, res) => {
  const { tenantId, branchId } = req;
  const { search, status, page, limit } = req.query;

  const result = await cashCounterService.getAll(tenantId, branchId, {
    search,
    status: status !== undefined ? status === "true" : undefined,
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 50
  });

  return res.status(200).json(new ApiResponse(200, result, "Cash counters retrieved successfully"));
});

export const getCashCounter = asyncHandler(async (req, res) => {
  const { tenantId } = req;
  const { id } = req.params;

  const counter = await cashCounterService.getById(tenantId, id);
  return res.status(200).json(new ApiResponse(200, counter, "Cash counter retrieved successfully"));
});

export const createCashCounter = asyncHandler(async (req, res) => {
  const { tenantId, branchId, userId } = req;
  const validatedData = createCashCounterSchema.parse(req.body);

  const counter = await cashCounterService.create(tenantId, branchId, userId, validatedData);
  return res.status(201).json(new ApiResponse(201, counter, "Cash counter created successfully"));
});

export const updateCashCounter = asyncHandler(async (req, res) => {
  const { tenantId, userId } = req;
  const { id } = req.params;
  const validatedData = updateCashCounterSchema.parse(req.body);

  const counter = await cashCounterService.update(tenantId, id, userId, validatedData);
  return res.status(200).json(new ApiResponse(200, counter, "Cash counter updated successfully"));
});

export const deleteCashCounter = asyncHandler(async (req, res) => {
  const { tenantId, userId } = req;
  const { id } = req.params;

  const result = await cashCounterService.delete(tenantId, id, userId);
  return res.status(200).json(new ApiResponse(200, result, "Cash counter deleted successfully"));
});

// ==================== Cashier Profile Controllers ====================

export const getCashierProfiles = asyncHandler(async (req, res) => {
  const { tenantId, branchId } = req;
  const { search, status, page, limit } = req.query;

  const result = await cashierProfileService.getAll(tenantId, branchId, {
    search,
    status: status !== undefined ? status === "true" : undefined,
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 50
  });

  return res.status(200).json(new ApiResponse(200, result, "Cashier profiles retrieved successfully"));
});

export const getCashierProfile = asyncHandler(async (req, res) => {
  const { tenantId } = req;
  const { id } = req.params;

  const profile = await cashierProfileService.getById(tenantId, id);
  return res.status(200).json(new ApiResponse(200, profile, "Cashier profile retrieved successfully"));
});

export const getCashierProfileByUser = asyncHandler(async (req, res) => {
  const { tenantId, userId } = req;

  const profile = await cashierProfileService.getByUserId(tenantId, userId);
  
  if (!profile) {
    return res.status(404).json(new ApiResponse(404, null, "Cashier profile not found for this user"));
  }

  return res.status(200).json(new ApiResponse(200, profile, "Cashier profile retrieved successfully"));
});

export const createCashierProfile = asyncHandler(async (req, res) => {
  const { tenantId, branchId, userId } = req;
  const validatedData = createCashierProfileSchema.parse(req.body);

  const profile = await cashierProfileService.create(tenantId, branchId, userId, validatedData);
  return res.status(201).json(new ApiResponse(201, profile, "Cashier profile created successfully"));
});

export const updateCashierProfile = asyncHandler(async (req, res) => {
  const { tenantId, userId } = req;
  const { id } = req.params;
  const validatedData = updateCashierProfileSchema.parse(req.body);

  const profile = await cashierProfileService.update(tenantId, id, userId, validatedData);
  return res.status(200).json(new ApiResponse(200, profile, "Cashier profile updated successfully"));
});

export const deleteCashierProfile = asyncHandler(async (req, res) => {
  const { tenantId, userId } = req;
  const { id } = req.params;

  const result = await cashierProfileService.delete(tenantId, id, userId);
  return res.status(200).json(new ApiResponse(200, result, "Cashier profile deleted successfully"));
});

// ==================== Cash Session Controllers ====================

export const getCashSessions = asyncHandler(async (req, res) => {
  const { tenantId, branchId } = req;
  const { cashierId, counterId, status, search, page, limit } = req.query;

  const result = await cashSessionService.getAll(tenantId, branchId, {
    cashierId,
    counterId,
    status,
    search,
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 50
  });

  return res.status(200).json(new ApiResponse(200, result, "Cash sessions retrieved successfully"));
});

export const getCashSession = asyncHandler(async (req, res) => {
  const { tenantId } = req;
  const { id } = req.params;

  const session = await cashSessionService.getById(tenantId, id);
  return res.status(200).json(new ApiResponse(200, session, "Cash session retrieved successfully"));
});

export const getOpenCashSession = asyncHandler(async (req, res) => {
  const { tenantId, userId } = req;
  
  // Get cashier profile for the current user
  const cashierProfile = await cashierProfileService.getByUserId(tenantId, userId);
  
  if (!cashierProfile) {
    return res.status(404).json(new ApiResponse(404, null, "No cashier profile found for this user"));
  }

  const session = await cashSessionService.getOpenSession(tenantId, cashierProfile.id);
  
  if (!session) {
    return res.status(404).json(new ApiResponse(404, null, "No open session found"));
  }

  return res.status(200).json(new ApiResponse(200, session, "Open session retrieved successfully"));
});

export const openCashSession = asyncHandler(async (req, res) => {
  const { tenantId, branchId, userId } = req;
  const validatedData = openCashSessionSchema.parse(req.body);

  const session = await cashSessionService.open(tenantId, branchId, userId, validatedData);
  return res.status(201).json(new ApiResponse(201, session, "Cash session opened successfully"));
});

export const closeCashSession = asyncHandler(async (req, res) => {
  const { tenantId, userId } = req;
  const { id } = req.params;
  const validatedData = closeCashSessionSchema.parse(req.body);

  const session = await cashSessionService.close(tenantId, id, userId, validatedData);
  return res.status(200).json(new ApiResponse(200, session, "Cash session closed successfully"));
});

export const recordCashPayment = asyncHandler(async (req, res) => {
  const { tenantId, userId } = req;
  const validatedData = recordCashPaymentSchema.parse(req.body);

  const payment = await cashSessionService.recordPayment(tenantId, userId, validatedData);
  return res.status(201).json(new ApiResponse(201, payment, "Payment recorded successfully"));
});

export const requestRefund = asyncHandler(async (req, res) => {
  const { tenantId, branchId, userId } = req;
  const validatedData = requestRefundSchema.parse(req.body);

  const refund = await cashSessionService.requestRefund(tenantId, branchId, userId, validatedData);
  return res.status(201).json(new ApiResponse(201, refund, "Refund request submitted successfully"));
});

export const approveRefund = asyncHandler(async (req, res) => {
  const { tenantId, userId } = req;
  const { id } = req.params;
  const validatedData = approveRefundSchema.parse({ refundId: id, ...req.body });

  const refund = await cashSessionService.approveRefund(tenantId, id, userId, validatedData);
  return res.status(200).json(new ApiResponse(200, refund, "Refund approved successfully"));
});

export const rejectRefund = asyncHandler(async (req, res) => {
  const { tenantId, userId } = req;
  const { id } = req.params;
  const validatedData = rejectRefundSchema.parse({ refundId: id, ...req.body });

  const refund = await cashSessionService.rejectRefund(tenantId, id, userId, validatedData);
  return res.status(200).json(new ApiResponse(200, refund, "Refund rejected successfully"));
});

export const submitHandover = asyncHandler(async (req, res) => {
  const { tenantId, userId } = req;
  const validatedData = submitHandoverSchema.parse(req.body);

  const handover = await cashSessionService.submitHandover(tenantId, userId, validatedData);
  return res.status(201).json(new ApiResponse(201, handover, "Handover submitted successfully"));
});

export const reviewHandover = asyncHandler(async (req, res) => {
  const { tenantId, userId } = req;
  const { id } = req.params;
  const validatedData = reviewHandoverSchema.parse({ handoverId: id, ...req.body });

  const handover = await cashSessionService.reviewHandover(tenantId, id, userId, validatedData);
  return res.status(200).json(new ApiResponse(200, handover, "Handover reviewed successfully"));
});

export const getCashDashboardStats = asyncHandler(async (req, res) => {
  const { tenantId, branchId } = req;
  const { dateFrom, dateTo } = req.query;

  const stats = await cashSessionService.getDashboardStats(tenantId, branchId, { dateFrom, dateTo });
  return res.status(200).json(new ApiResponse(200, stats, "Dashboard stats retrieved successfully"));
});
