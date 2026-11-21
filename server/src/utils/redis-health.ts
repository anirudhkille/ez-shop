import { logger } from "@/config/logger";
import { redis } from "@/config/redis";

export type RedisHealthStatus = "ok" | "unavailable" | "disabled";

export interface RedisHealthResult {
  status: RedisHealthStatus;
  checkedAt?: string;
  latencyMs?: number;
}

interface RedisPingClient {
  ping: () => Promise<unknown>;
}

interface RedisHealthLogger {
  warn: (payload: Record<string, unknown>, message?: string) => void;
}

export interface RedisHealthOptions {
  client?: RedisPingClient | null;
  intervalMs?: number;
  timeoutMs?: number;
  now?: () => number;
  logger?: RedisHealthLogger;
}

const DEFAULT_INTERVAL_MS = 6 * 60 * 60 * 1000;
const FAILURE_RETRY_MS = 60 * 1000;
const DEFAULT_TIMEOUT_MS = 2000;

const withTimeout = async <T>(promise: Promise<T>, timeoutMs: number) => {
  let timer: ReturnType<typeof setTimeout> | undefined;

  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timer = setTimeout(
          () => reject(new Error("Redis ping timed out")),
          timeoutMs,
        );
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
};

/**
 * Health checks can be hit very frequently by the host. A ping is therefore
 * reused for a few hours: it keeps an idle Upstash database active without
 * spending a Redis command on every single request.
 */
export const createRedisHealthCheck = (options: RedisHealthOptions = {}) => {
  const client = options.client === undefined ? redis : options.client;
  const intervalMs = options.intervalMs ?? DEFAULT_INTERVAL_MS;
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const now = options.now ?? Date.now;
  const healthLogger = options.logger ?? logger;

  let lastCheckAt = 0;
  let lastIntervalMs = intervalMs;
  let lastResult: RedisHealthResult = client
    ? { status: "unavailable" }
    : { status: "disabled" };
  let inFlight: Promise<RedisHealthResult> | null = null;

  const runCheck = async (): Promise<RedisHealthResult> => {
    const startedAt = now();

    try {
      await withTimeout(client!.ping(), timeoutMs);

      const checkedAt = now();
      lastResult = {
        status: "ok",
        checkedAt: new Date(checkedAt).toISOString(),
        latencyMs: checkedAt - startedAt,
      };
      lastIntervalMs = intervalMs;
    } catch (error) {
      healthLogger.warn(
        { err: error instanceof Error ? error.message : String(error) },
        "Redis health ping failed",
      );

      const checkedAt = now();
      lastResult = {
        status: "unavailable",
        checkedAt: new Date(checkedAt).toISOString(),
        latencyMs: checkedAt - startedAt,
      };
      // Retry failures soon instead of serving a stale "unavailable" for hours.
      lastIntervalMs = FAILURE_RETRY_MS;
    }

    lastCheckAt = now();

    return lastResult;
  };

  return async (): Promise<RedisHealthResult> => {
    if (!client) return { status: "disabled" };

    if (lastCheckAt > 0 && now() - lastCheckAt < lastIntervalMs) {
      return lastResult;
    }

    if (!inFlight) {
      inFlight = runCheck().finally(() => {
        inFlight = null;
      });
    }

    return inFlight;
  };
};

export const getRedisHealth = createRedisHealthCheck();

/** Warm the cache once at startup so /api/health never waits on a cold ping. */
export const warmRedisHealth = async () => {
  await getRedisHealth();
};
