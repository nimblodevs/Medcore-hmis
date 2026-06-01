import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(4000),
  API_PREFIX: z.string().default("/api"),
  DATABASE_URL: z.string().min(1),
  DIRECT_URL: z.string().optional(),
  JWT_ACCESS_SECRET: z.string().min(16),
  JWT_REFRESH_SECRET: z.string().min(16),
  JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),
  BCRYPT_SALT_ROUNDS: z.coerce.number().min(8).max(15).default(12),
  CORS_ORIGIN: z.string().default("http://localhost:5000"),
  TRUST_PROXY: z.coerce.number().int().min(0).default(1),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(15 * 60 * 1000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(200)
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const issueMessage = parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; ");
  throw new Error(`Invalid environment variables: ${issueMessage}`);
}

const env = parsed.data;

export default env;
