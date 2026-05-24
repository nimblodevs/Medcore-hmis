import { debtorSchemeRepository } from "../repositories/debtor-scheme.repository.js";
import { 
  createDebtorSchemeSchema, 
  updateDebtorSchemeSchema 
} from "../validators/debtor-scheme.validator.js";

export class DebtorSchemeController {
  async create(req, res) {
    try {
      const validatedData = createDebtorSchemeSchema.parse(req.body);
      const user = req.user;

      // Check for duplicate scheme code
      const isDuplicate = await debtorSchemeRepository.checkDuplicateCode(
        validatedData.debtorAccountId,
        validatedData.schemeCode,
        user.tenantId
      );

      if (isDuplicate) {
        return res.status(409).json({
          success: false,
          message: "A scheme with this code already exists for this debtor account",
          errors: []
        });
      }

      const scheme = await debtorSchemeRepository.create(validatedData, user);

      return res.status(201).json({
        success: true,
        message: "Debtor scheme created successfully",
        data: scheme
      });
    } catch (error) {
      if (error.name === "ZodError") {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: error.errors.map(e => ({
            field: e.path.join("."),
            message: e.message
          }))
        });
      }

      console.error("Error creating debtor scheme:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to create debtor scheme",
        errors: []
      });
    }
  }

  async findAll(req, res) {
    try {
      const user = req.user;
      const { 
        debtorAccountId, 
        status, 
        schemeType, 
        search, 
        page = "1", 
        limit = "50" 
      } = req.query;

      const pageNum = parseInt(page, 10);
      const limitNum = parseInt(limit, 10);
      const offset = (pageNum - 1) * limitNum;

      const result = await debtorSchemeRepository.findAll(user.tenantId, {
        debtorAccountId,
        status,
        schemeType,
        search,
        limit: limitNum,
        offset
      });

      return res.json({
        success: true,
        message: "Schemes retrieved successfully",
        data: {
          schemes: result.schemes,
          pagination: {
            total: result.total,
            page: pageNum,
            limit: limitNum,
            totalPages: Math.ceil(result.total / limitNum)
          }
        }
      });
    } catch (error) {
      console.error("Error fetching schemes:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch schemes",
        errors: []
      });
    }
  }

  async findById(req, res) {
    try {
      const { id } = req.params;
      const user = req.user;

      const scheme = await debtorSchemeRepository.findById(id, user.tenantId);

      if (!scheme) {
        return res.status(404).json({
          success: false,
          message: "Scheme not found",
          errors: []
        });
      }

      return res.json({
        success: true,
        message: "Scheme retrieved successfully",
        data: scheme
      });
    } catch (error) {
      console.error("Error fetching scheme:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch scheme",
        errors: []
      });
    }
  }

  async findByDebtorAccount(req, res) {
    try {
      const { debtorAccountId } = req.params;
      const { status, schemeType, includeInactive = "false" } = req.query;
      const user = req.user;

      const schemes = await debtorSchemeRepository.findByDebtorAccount(
        debtorAccountId,
        user.tenantId,
        {
          status: status || undefined,
          schemeType: schemeType || undefined,
          includeInactive: includeInactive === "true"
        }
      );

      return res.json({
        success: true,
        message: "Schemes retrieved successfully",
        data: schemes
      });
    } catch (error) {
      console.error("Error fetching schemes by debtor:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch schemes",
        errors: []
      });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const validatedData = updateDebtorSchemeSchema.parse(req.body);
      const user = req.user;

      // Check for duplicate scheme code if code is being updated
      if (validatedData.schemeCode) {
        const existing = await debtorSchemeRepository.findById(id, user.tenantId);
        if (existing && existing.schemeCode !== validatedData.schemeCode) {
          const isDuplicate = await debtorSchemeRepository.checkDuplicateCode(
            existing.debtorAccountId,
            validatedData.schemeCode,
            user.tenantId,
            id
          );

          if (isDuplicate) {
            return res.status(409).json({
              success: false,
              message: "A scheme with this code already exists for this debtor account",
              errors: []
            });
          }
        }
      }

      const scheme = await debtorSchemeRepository.update(id, validatedData, user);

      return res.json({
        success: true,
        message: "Debtor scheme updated successfully",
        data: scheme
      });
    } catch (error) {
      if (error.name === "ZodError") {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: error.errors.map(e => ({
            field: e.path.join("."),
            message: e.message
          }))
        });
      }

      if (error.message === "Scheme not found") {
        return res.status(404).json({
          success: false,
          message: "Scheme not found",
          errors: []
        });
      }

      console.error("Error updating debtor scheme:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to update debtor scheme",
        errors: []
      });
    }
  }

  async activate(req, res) {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const user = req.user;

      const scheme = await debtorSchemeRepository.changeStatus(
        id,
        "ACTIVE",
        reason || "Scheme activated",
        user
      );

      return res.json({
        success: true,
        message: "Scheme activated successfully",
        data: scheme
      });
    } catch (error) {
      console.error("Error activating scheme:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to activate scheme",
        errors: []
      });
    }
  }

  async deactivate(req, res) {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const user = req.user;

      const scheme = await debtorSchemeRepository.changeStatus(
        id,
        "INACTIVE",
        reason || "Scheme deactivated",
        user
      );

      return res.json({
        success: true,
        message: "Scheme deactivated successfully",
        data: scheme
      });
    } catch (error) {
      console.error("Error deactivating scheme:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to deactivate scheme",
        errors: []
      });
    }
  }

  async suspend(req, res) {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      if (!reason) {
        return res.status(400).json({
          success: false,
          message: "Reason is required for suspension",
          errors: []
        });
      }

      const user = req.user;
      const scheme = await debtorSchemeRepository.changeStatus(
        id,
        "SUSPENDED",
        reason,
        user
      );

      return res.json({
        success: true,
        message: "Scheme suspended successfully",
        data: scheme
      });
    } catch (error) {
      console.error("Error suspending scheme:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to suspend scheme",
        errors: []
      });
    }
  }

  async archive(req, res) {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      if (!reason) {
        return res.status(400).json({
          success: false,
          message: "Reason is required for archiving",
          errors: []
        });
      }

      const user = req.user;
      const scheme = await debtorSchemeRepository.changeStatus(
        id,
        "ARCHIVED",
        reason,
        user
      );

      return res.json({
        success: true,
        message: "Scheme archived successfully",
        data: scheme
      });
    } catch (error) {
      console.error("Error archiving scheme:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to archive scheme",
        errors: []
      });
    }
  }
}

export const debtorSchemeController = new DebtorSchemeController();
