const sanitizeObject = (value) => {
  if (Array.isArray(value)) return value.map(sanitizeObject);
  if (!value || typeof value !== "object") return value;

  const output = {};
  Object.keys(value).forEach((key) => {
    if (["__proto__", "prototype", "constructor"].includes(key)) return;
    const nextValue = sanitizeObject(value[key]);
    output[key] = typeof nextValue === "string" ? nextValue.trim() : nextValue;
  });
  return output;
};

const sanitizeRequest = (req, _res, next) => {
  if (req.body && typeof req.body === "object") req.body = sanitizeObject(req.body);
  if (req.query && typeof req.query === "object") req.query = sanitizeObject(req.query);
  if (req.params && typeof req.params === "object") req.params = sanitizeObject(req.params);
  next();
};

export default sanitizeRequest;
