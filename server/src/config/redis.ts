import { Redis } from "@upstash/redis";

import { env } from "@/config/env.config";
import type { RedisCacheStore } from "@/utils/shared-cache";

const configured =
  env.UPSTASH_REDIS_REST_URL.length > 0 &&
  env.UPSTASH_REDIS_REST_TOKEN.length > 0;

const REQUEST_TIMEOUT_MS = 1000;

/**
 * Upstash Redis is optional. Without both REST credentials the API keeps using
 * its in-process caches and fixed-window rate limiters.
 *
 * Every request gets a short timeout and at most one retry so a slow Upstash
 * region cannot hold an API request open. Callers fall back to local caches
 * and limiters when a request fails.
 */
export const redis = configured
  ? new Redis({
      url: env.UPSTASH_REDIS_REST_URL,
      token: env.UPSTASH_REDIS_REST_TOKEN,
      retry: { retries: 1, backoff: () => 50 },
      signal: () => AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    })
  : null;

export const redisCacheStore: RedisCacheStore | null = redis
  ? {
      get: <T>(key: string) => redis.get<T>(key),
      set: (key, value, options) => redis.set(key, value, options),
      del: (key) => redis.del(key),
    }
  : null;
