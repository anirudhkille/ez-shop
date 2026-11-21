import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { createRedisHealthCheck } from "./redis-health.js";

const silentLogger = {
  warn: () => {},
};

describe("createRedisHealthCheck", () => {
  it("reports disabled when Redis is not configured", async () => {
    const check = createRedisHealthCheck({
      client: null,
      logger: silentLogger,
    });

    assert.deepEqual(await check(), { status: "disabled" });
  });

  it("pings Redis and reports latency", async () => {
    let now = 1_000;
    let pings = 0;
    const check = createRedisHealthCheck({
      client: {
        ping: async () => {
          pings += 1;
          return "PONG";
        },
      },
      now: () => now,
      logger: silentLogger,
    });

    const result = await check();

    assert.equal(pings, 1);
    assert.equal(result.status, "ok");
    assert.equal(result.latencyMs, 0);
    assert.equal(result.checkedAt, new Date(now).toISOString());
  });

  it("reuses the last result until the ping interval passes", async () => {
    let now = 1_000;
    let pings = 0;
    const check = createRedisHealthCheck({
      client: {
        ping: async () => {
          pings += 1;
          return "PONG";
        },
      },
      now: () => now,
      intervalMs: 60_000,
      logger: silentLogger,
    });

    await check();
    now += 59_999;
    const cached = await check();
    now += 1;
    const refreshed = await check();

    assert.equal(pings, 2);
    assert.equal(cached.status, "ok");
    assert.equal(refreshed.status, "ok");
  });

  it("shares one ping between concurrent health checks", async () => {
    let pings = 0;
    let resolvePing: (() => void) | undefined;
    const pending = new Promise<void>((resolve) => {
      resolvePing = resolve;
    });
    const check = createRedisHealthCheck({
      client: {
        ping: async () => {
          pings += 1;
          await pending;
          return "PONG";
        },
      },
      logger: silentLogger,
    });

    const first = check();
    const second = check();
    resolvePing?.();

    const [a, b] = await Promise.all([first, second]);

    assert.equal(pings, 1);
    assert.equal(a.status, "ok");
    assert.equal(b.status, "ok");
  });

  it("reports unavailable when Redis rejects the ping", async () => {
    const warnings: unknown[] = [];
    const check = createRedisHealthCheck({
      client: {
        ping: async () => {
          throw new Error("connection refused");
        },
      },
      logger: {
        warn: (payload) => warnings.push(payload),
      },
    });

    const result = await check();

    assert.equal(result.status, "unavailable");
    assert.equal(warnings.length, 1);
  });

  it("reports unavailable when the ping times out", async () => {
    const check = createRedisHealthCheck({
      client: {
        ping: () => new Promise(() => {}),
      },
      timeoutMs: 10,
      logger: silentLogger,
    });

    const result = await check();

    assert.equal(result.status, "unavailable");
  });
});
