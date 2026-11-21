import { Redis } from "@upstash/redis";

import { env } from "@/config/env.config";
import type { RedisCacheStore } from "@/utils/shared-cache";

const configured =
  env.UPSTASH_REDIS_REST_URL.length > 0 &&
  env.UPSTASH_REDIS_REST_TOKEN.length > 0;

/**
 * Upstash Redis is optional. Without both REST credentials the API keeps using
 * its in-process caches and fixed-window rate limiters.
 */
export const redis = configured
  ? new Redis({
      url: env.UPSTASH_REDIS_REST_URL,
      token: env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

export const redisCacheStore: RedisCacheStore | null = redis
  ? {
      get: <T>(key: string) => redis.get<T>(key),
      set: (key, value, options) => redis.set(key, value, options),
      del: (key) => redis.del(key),
    }
  : null;
