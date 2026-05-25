import ApiError from "../utils/apiError.js";

const validateRequest = (schema, source = "body") => (req, _res, next) => {
  const result = schema.safeParse(req[source] || {});
  if (!result.success) {
    return next(
      new ApiError(
        400,
        "Validation error",
        result.error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message
        }))
      )
    );
  }
  req[source] = result.data;
  return next();
};

export { validateRequest };
export default validateRequest;
