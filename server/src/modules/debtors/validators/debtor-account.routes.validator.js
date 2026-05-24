import { Request, Response, NextFunction } from "express";
import { createDebtorAccountSchema, updateDebtorAccountSchema, activateDebtorAccountSchema, holdDebtorAccountSchema, suspendDebtorAccountSchema, closeDebtorAccountSchema } from "../validators/debtor-account.validator.js";

export function createDebtorAccountValidator(req: Request, res: Response, next: NextFunction) {
  try {
    const validatedData = createDebtorAccountSchema.parse(req.body);
    req.validatedData = validatedData;
    next();
  } catch (error) {
    if (error.errors) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: error.errors.map((err: any) => ({
          field: err.path.join('.'),
          message: err.message
        }))
      });
    }
    next(error);
  }
}

export function updateDebtorAccountValidator(req: Request, res: Response, next: NextFunction) {
  try {
    const validatedData = updateDebtorAccountSchema.parse(req.body);
    req.validatedData = validatedData;
    next();
  } catch (error) {
    if (error.errors) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: error.errors.map((err: any) => ({
          field: err.path.join('.'),
          message: err.message
        }))
      });
    }
    next(error);
  }
}

export function statusActionValidator(req: Request, res: Response, next: NextFunction) {
  try {
    const action = req.path.split('/').pop();
    
    let schema;
    switch (action) {
      case 'activate':
        schema = activateDebtorAccountSchema;
        break;
      case 'hold':
        schema = holdDebtorAccountSchema;
        break;
      case 'suspend':
        schema = suspendDebtorAccountSchema;
        break;
      case 'close':
        schema = closeDebtorAccountSchema;
        break;
      default:
        // For actions without body requirements (release-hold, archive)
        req.validatedData = {};
        return next();
    }

    const validatedData = schema.parse(req.body);
    req.validatedData = validatedData;
    next();
  } catch (error) {
    if (error.errors) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: error.errors.map((err: any) => ({
          field: err.path.join('.'),
          message: err.message
        }))
      });
    }
    next(error);
  }
}

export default {
  createDebtorAccountValidator,
  updateDebtorAccountValidator,
  statusActionValidator
};
