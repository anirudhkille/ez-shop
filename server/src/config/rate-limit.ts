import type { Request, RequestHandler, Response } from "express";
import { ipKeyGenerator } from "express-rate-limit";

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  /** Unix timestamp in milliseconds when the window resets. */
  reset: number;
  reason?: string;
}

export interface RateLimiterOptions {
  name: string;
  windowMs: number;
  max: number;
  message: string | Record<string, unknown>;
  skip?: (req: Request) => boolean;
}

export interface RateLimiterLogger {
  warn: (payload: Record<string, unknown>, message?: string) => void;
}

export interface RateLimiterDependencies {
  limit?: (identifier: string) => Promise<RateLimitResult>;
  fallback: RequestHandler;
  logger?: RateLimiterLogger;
}

const setRateLimitHeaders = (
  res: Response,
  result: RateLimitResult,
  windowMs: number,
) => {
  const resetSeconds = Math.max(
    0,
    Math.ceil((result.reset - Date.now()) / 1000),
  );

  res.setHeader("RateLimit-Limit", String(result.limit));
  res.setHeader("RateLimit-Remaining", String(result.remaining));
  res.setHeader("RateLimit-Reset", String(resetSeconds));
  res.setHeader(
    "RateLimit-Policy",
    `${result.limit};w=${Math.ceil(windowMs / 1000)}`,
  );

  if (!result.success) {
    res.setHeader("Retry-After", String(resetSeconds));
  }
};

const sendRateLimitResponse = (
  res: Response,
  message: string | Record<string, unknown>,
) => {
  if (typeof message === "string") {
    res.status(429).send(message);
    return;
  }

  res.status(429).json(message);
};

/**
 * Wraps a distributed limiter (Upstash) with the existing in-memory limiter as
 * a fallback. If Redis is not configured, unavailable, or times out, the
 * request continues through the local limiter so a Redis outage cannot take
 * the API down.
 */
export const createRateLimiter = (
  options: RateLimiterOptions,
  dependencies: RateLimiterDependencies,
): RequestHandler => {
  const { fallback, limit, logger } = dependencies;

  if (!limit) return fallback;

  return async (req, res, next) => {
    if (options.skip?.(req)) {
      next();
      return;
    }

    try {
      const ip = req.ip;
      if (!ip) {
        res.status(400).json({
          success: false,
          message: "Unable to determine client IP address.",
          error: { code: "INVALID_CLIENT_IP" },
        });
        return;
      }

      const result = await limit(ipKeyGenerator(ip));

      if (result.reason === "timeout") {
        throw new Error("Upstash rate limit timed out");
      }

      setRateLimitHeaders(res, result, options.windowMs);

      if (!result.success) {
        sendRateLimitResponse(res, options.message);
        return;
      }

      next();
    } catch (error) {
      logger?.warn(
        {
          err: error instanceof Error ? error.message : String(error),
          limiter: options.name,
        },
        "Distributed rate limiter unavailable; using local limiter",
      );

      fallback(req, res, next);
    }
  };
};
