import "dotenv/config";

import { z } from "zod";

import { logger } from "./logger.js";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().default(8080),

  MONGO_URI: z.string().min(1, "MONGO_URI is required"),

  CORS_ORIGINS: z
    .string()
    .default("")
    .transform((value) =>
      value
        .split(",")
        .map((origin) => origin.trim())
        .filter(Boolean),
    ),

  SESSION_SECRET: z.string().min(1, "SESSION_SECRET is required"),

  JWT_ACCESS_SECRET: z.string().min(1, "JWT_ACCESS_SECRET is required"),
  JWT_REFRESH_SECRET: z.string().min(1, "JWT_REFRESH_SECRET is required"),

  GOOGLE_CLIENT_ID: z.string().min(1, "GOOGLE_CLIENT_ID is required"),
  GOOGLE_CLIENT_SECRET: z.string().min(1, "GOOGLE_CLIENT_SECRET is required"),
  GOOGLE_CALLBACK_URL: z.string().min(1, "GOOGLE_CALLBACK_URL is required"),

  CLIENT_URL: z.string().min(1, "CLIENT_URL is required"),
  ADMIN_URL: z.string().min(1, "ADMIN_URL is required"),

  CLOUDINARY_NAME: z.string().min(1, "CLOUDINARY_NAME is required"),
  CLOUDINARY_KEY: z.string().min(1, "CLOUDINARY_KEY is required"),
  CLOUDINARY_SECRET: z.string().min(1, "CLOUDINARY_SECRET is required"),

  RESEND_API_KEY: z.string().min(1, "RESEND_API_KEY is required"),
  EMAIL_FROM: z.string().min(1, "EMAIL_FROM is required"),

  SMTP_HOST: z.string().default("localhost"),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_EMAIL: z.string().min(1, "SMTP_EMAIL is required"),
  SMTP_PASSWORD: z.string().min(1, "SMTP_PASSWORD is required"),

  STRIPE_SECRET_KEY: z.string().min(1, "STRIPE_SECRET_KEY is required"),
  STRIPE_WEBHOOK_SECRET: z.string().min(1, "STRIPE_WEBHOOK_SECRET is required"),

  UPSTASH_REDIS_REST_URL: z.string().min(1, "UPSTASH_REDIS_REST_URL is required"),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1, "UPSTASH_REDIS_REST_TOKEN is required"),
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
  logger.error("Invalid environment variables");

  result.error.issues.forEach((issue) => {
    logger.error(`${issue.path.join(", ")}: ${issue.message}`);
  });

  process.exit(1);
}

export const env = result.data;
