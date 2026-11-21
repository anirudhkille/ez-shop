import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { NextFunction, Request, RequestHandler, Response } from "express";

import {
  createRateLimiter,
  type RateLimitResult,
  type RateLimiterOptions,
} from "./rate-limit.js";

const createRequest = (ip = "203.0.113.10") =>
  ({ ip, headers: {} }) as unknown as Request;

const createResponse = () => {
  const headers = new Map<string, string>();
  const response = {
    body: undefined as unknown,
    headers,
    statusCode: 200,
    json(payload: unknown) {
      this.body = payload;
      return this;
    },
    send(payload: unknown) {
      this.body = payload;
      return this;
    },
    setHeader(name: string, value: string | number) {
      headers.set(name, String(value));
      return this;
    },
    status(code: number) {
      this.statusCode = code;
      return this;
    },
  };

  return response as typeof response & Response;
};

const createOptions = (
  overrides: Partial<RateLimiterOptions> = {},
): RateLimiterOptions => ({
  name: "test",
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: "Too many requests",
  ...overrides,
});

const createLimit = (result: RateLimitResult) => {
  const calls: string[] = [];

  return {
    calls,
    limit: async (identifier: string) => {
      calls.push(identifier);
      return result;
    },
  };
};

const passThrough: RequestHandler = (_req, _res, next) => next();

describe("createRateLimiter", () => {
  it("allows a request and sets standard rate limit headers", async () => {
    const options = createOptions();
    const response = createResponse();
    const nextCalls: string[] = [];
    const next: NextFunction = () => nextCalls.push("next");
    const { calls, limit } = createLimit({
      success: true,
      limit: 10,
      remaining: 9,
      reset: Date.now() + 60_000,
    });

    const middleware = createRateLimiter(options, {
      limit,
      fallback: passThrough,
    });

    await middleware(createRequest(), response, next);

    assert.deepEqual(calls, ["203.0.113.10"]);
    assert.deepEqual(nextCalls, ["next"]);
    assert.equal(response.statusCode, 200);
    assert.equal(response.headers.get("RateLimit-Limit"), "10");
    assert.equal(response.headers.get("RateLimit-Remaining"), "9");
    assert.ok(Number(response.headers.get("RateLimit-Reset")) > 0);
    assert.equal(response.headers.get("RateLimit-Policy"), "10;w=900");
  });

  it("rejects a request once the distributed limit is exhausted", async () => {
    const options = createOptions({
      message: { success: false, error: { code: "RATE_LIMITED" } },
    });
    const response = createResponse();
    const nextCalls: string[] = [];
    const next: NextFunction = () => nextCalls.push("next");
    const { limit } = createLimit({
      success: false,
      limit: 10,
      remaining: 0,
      reset: Date.now() + 60_000,
    });

    const middleware = createRateLimiter(options, {
      limit,
      fallback: passThrough,
    });

    await middleware(createRequest(), response, next);

    assert.deepEqual(nextCalls, []);
    assert.equal(response.statusCode, 429);
    assert.deepEqual(response.body, options.message);
    assert.ok(Number(response.headers.get("Retry-After")) > 0);
  });

  it("skips the distributed check when the limiter is disabled for a request", async () => {
    const options = createOptions({ skip: () => true });
    const response = createResponse();
    const nextCalls: string[] = [];
    const next: NextFunction = () => nextCalls.push("next");
    const { calls, limit } = createLimit({
      success: false,
      limit: 0,
      remaining: 0,
      reset: 0,
    });

    const middleware = createRateLimiter(options, {
      limit,
      fallback: passThrough,
    });

    await middleware(createRequest(), response, next);

    assert.deepEqual(calls, []);
    assert.deepEqual(nextCalls, ["next"]);
  });

  it("rejects requests without a client IP", async () => {
    const options = createOptions();
    const response = createResponse();
    const nextCalls: string[] = [];
    const next: NextFunction = () => nextCalls.push("next");
    let limitCalled = false;

    const middleware = createRateLimiter(options, {
      limit: async () => {
        limitCalled = true;
        return {
          success: true,
          limit: 10,
          remaining: 9,
          reset: Date.now() + 60_000,
        };
      },
      fallback: passThrough,
    });

    await middleware(createRequest(""), response, next);

    assert.equal(limitCalled, false);
    assert.deepEqual(nextCalls, []);
    assert.equal(response.statusCode, 400);
    assert.deepEqual(response.body, {
      success: false,
      message: "Unable to determine client IP address.",
      error: { code: "INVALID_CLIENT_IP" },
    });
  });

  it("falls back to the local limiter when Upstash errors", async () => {
    const options = createOptions();
    const response = createResponse();
    const nextCalls: string[] = [];
    const next: NextFunction = () => nextCalls.push("next");
    const warnings: unknown[] = [];

    const middleware = createRateLimiter(options, {
      limit: async () => {
        throw new Error("Upstash unavailable");
      },
      fallback: (_req, _res, fallbackNext) => {
        fallbackNext();
      },
      logger: {
        warn: (payload) => warnings.push(payload),
      },
    });

    await middleware(createRequest(), response, next);

    assert.deepEqual(nextCalls, ["next"]);
    assert.equal(warnings.length, 1);
  });

  it("falls back to the local limiter when Upstash times out", async () => {
    const options = createOptions();
    const response = createResponse();
    const nextCalls: string[] = [];
    const next: NextFunction = () => nextCalls.push("next");
    const warnings: unknown[] = [];

    const middleware = createRateLimiter(options, {
      limit: async () => ({
        success: true,
        limit: 0,
        remaining: 0,
        reset: 0,
        reason: "timeout",
      }),
      fallback: (_req, _res, fallbackNext) => {
        fallbackNext();
      },
      logger: {
        warn: (payload) => warnings.push(payload),
      },
    });

    await middleware(createRequest(), response, next);

    assert.deepEqual(nextCalls, ["next"]);
    assert.equal(warnings.length, 1);
  });

  it("uses the local limiter when Upstash is not configured", async () => {
    const options = createOptions();
    const response = createResponse();
    const nextCalls: string[] = [];
    const next: NextFunction = () => nextCalls.push("next");

    const middleware = createRateLimiter(options, {
      fallback: (_req, _res, fallbackNext) => fallbackNext(),
    });

    await middleware(createRequest(), response, next);

    assert.deepEqual(nextCalls, ["next"]);
  });
});
