import type { Request } from "express";
import rateLimit from "express-rate-limit";
import { Ratelimit } from "@upstash/ratelimit";

import { logger } from "@/config/logger";
import {
  createRateLimiter,
  type RateLimiterOptions,
} from "@/config/rate-limit";
import { redis } from "@/config/redis";

const e2eBypassEnabled =
  process.env.NODE_ENV !== "production" &&
  process.env.E2E_BYPASS_RATE_LIMIT === "true";

const rateLimitDisabled = process.env.DISABLE_RATE_LIMIT === "true";

const configuredApiMax = Number(process.env.RATE_LIMIT_MAX);
const apiMax =
  Number.isFinite(configuredApiMax) && configuredApiMax > 0
    ? configuredApiMax
    : 1000;

const configuredAuthMax = Number(process.env.AUTH_RATE_LIMIT_MAX);
const authMax =
  Number.isFinite(configuredAuthMax) && configuredAuthMax > 0
    ? configuredAuthMax
    : 10;

const configuredMapboxMax = Number(process.env.MAPBOX_RATE_LIMIT_MAX);
const mapboxMax =
  Number.isFinite(configuredMapboxMax) && configuredMapboxMax > 0
    ? configuredMapboxMax
    : 60;

const configuredAiMax = Number(process.env.AI_RATE_LIMIT_MAX);
const aiMax =
  Number.isFinite(configuredAiMax) && configuredAiMax > 0
    ? configuredAiMax
    : 20;

const skipForTestOrDisabled = (req: Request) =>
  process.env.NODE_ENV === "test" ||
  rateLimitDisabled ||
  (e2eBypassEnabled && req.headers["x-e2e-test"] === "ezshop");

const createLimiter = (options: RateLimiterOptions) => {
  const local = rateLimit({
    windowMs: options.windowMs,
    max: options.max,
    standardHeaders: true,
    legacyHeaders: false,
    skip: options.skip,
    message: options.message,
  });

  if (!redis) {
    return createRateLimiter(options, { fallback: local });
  }

  const distributed = new Ratelimit({
    redis,
    limiter: Ratelimit.fixedWindow(options.max, `${options.windowMs} ms`),
    prefix: `ez-shop:ratelimit:${options.name}`,
    timeout: 2000,
    analytics: false,
  });

  return createRateLimiter(options, {
    limit: distributed.limit,
    fallback: local,
    logger,
  });
};

export const apiLimiter = createLimiter({
  name: "api",
  windowMs: 15 * 60 * 1000,
  max: apiMax,
  skip: () => rateLimitDisabled,
  message: "Too many requests from this IP, please try again later.",
});

export const authLimiter = createLimiter({
  name: "auth",
  windowMs: 15 * 60 * 1000,
  max: authMax,
  skip: skipForTestOrDisabled,
  message: {
    success: false,
    message: "Too many attempts from this IP, please try again later.",
    error: { code: "RATE_LIMITED" },
  },
});

export const mapboxLimiter = createLimiter({
  name: "mapbox",
  windowMs: 60 * 1000,
  max: mapboxMax,
  skip: skipForTestOrDisabled,
  message: {
    success: false,
    message: "Too many address lookups, please try again later.",
    error: { code: "RATE_LIMITED" },
  },
});

export const aiLimiter = createLimiter({
  name: "ai",
  windowMs: 15 * 60 * 1000,
  max: aiMax,
  skip: skipForTestOrDisabled,
  message: {
    success: false,
    message: "Too many AI requests, please try again later.",
    error: { code: "RATE_LIMITED" },
  },
});
