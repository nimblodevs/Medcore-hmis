import {
  activateDebtorAccountSchema,
  closeDebtorAccountSchema,
  createDebtorAccountSchema,
  holdDebtorAccountSchema,
  suspendDebtorAccountSchema,
  updateDebtorAccountSchema,
} from "../validators/debtor-account.validator.js";

const sendValidationError = (res, error) =>
  res.status(400).json({
    success: false,
    message: "Validation failed",
    errors: error.errors.map((err) => ({
      field: err.path.join("."),
      message: err.message,
    })),
  });

export function createDebtorAccountValidator(req, res, next) {
  try {
    req.validatedData = createDebtorAccountSchema.parse(req.body);
    next();
  } catch (error) {
    if (error.errors) {
      return sendValidationError(res, error);
    }
    next(error);
  }
}

export function updateDebtorAccountValidator(req, res, next) {
  try {
    req.validatedData = updateDebtorAccountSchema.parse(req.body);
    next();
  } catch (error) {
    if (error.errors) {
      return sendValidationError(res, error);
    }
    next(error);
  }
}

export function statusActionValidator(req, res, next) {
  try {
    const action = req.path.split("/").pop();

    const schemasByAction = {
      activate: activateDebtorAccountSchema,
      hold: holdDebtorAccountSchema,
      suspend: suspendDebtorAccountSchema,
      close: closeDebtorAccountSchema,
    };

    const schema = schemasByAction[action];
    if (!schema) {
      req.validatedData = {};
      return next();
    }

    req.validatedData = schema.parse(req.body);
    next();
  } catch (error) {
    if (error.errors) {
      return sendValidationError(res, error);
    }
    next(error);
  }
}

export default {
  createDebtorAccountValidator,
  updateDebtorAccountValidator,
  statusActionValidator,
};
