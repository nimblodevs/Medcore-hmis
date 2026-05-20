import ApiError from "../utils/apiError.js";

const errorHandler = (err, _req, res, _next) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.details || null
    });
  }

  return res.status(500).json({
    success: false,
    message: "Internal server error",
    errors: process.env.NODE_ENV === "development" ? { detail: err.message } : null
  });
};

export default errorHandler;
