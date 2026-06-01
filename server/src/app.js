import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import hpp from "hpp";
import env from "./config/env.js";
import apiRoutes from "./routes/index.js";
import sanitizeRequest from "./middlewares/sanitize.js";
import errorHandler from "./middlewares/errorHandler.js";
import notFound from "./middlewares/notFound.js";
import auditLogger from "./middlewares/auditLogger.js";

const app = express();
const configuredOrigins = env.CORS_ORIGIN.split(",").map((origin) => origin.trim()).filter(Boolean);
const csbOriginPattern = /^https:\/\/[a-z0-9-]+-\d+\.csb\.app$/i;

const isAllowedOrigin = (origin) => {
  if (!origin) return true;
  if (configuredOrigins.includes(origin)) return true;
  if (csbOriginPattern.test(origin)) return true;
  return false;
};
const corsOptions = {
  origin(origin, callback) {
    if (isAllowedOrigin(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"]
};

app.set("trust proxy", env.TRUST_PROXY);

app.use(helmet());
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(
  rateLimit({
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    max: env.RATE_LIMIT_MAX_REQUESTS
  })
);
app.use(hpp());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(sanitizeRequest);
app.use(auditLogger);

app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is healthy"
  });
});

app.use(env.API_PREFIX, apiRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
