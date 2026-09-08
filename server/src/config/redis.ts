import { Redis } from "@upstash/redis";
import { env } from "@/config/env.config";
import { logger } from "@/config/logger";

const redis = new Redis({
  url: env.UPSTASH_REDIS_REST_URL,
  token: env.UPSTASH_REDIS_REST_TOKEN,
});

async function safeSet(key: string, value: any, opts?: Record<string, unknown>) {
  try {
    if (opts) {
      return await redis.set(key, value, opts as any);
    }
    return await redis.set(key, value);
  } catch (error) {
    logger.error(`Redis set failed for key ${key}: ${(error as Error).message}`);
  }
}

async function safeGet<T = any>(key: string): Promise<T | null | undefined> {
  try {
    return await redis.get<T>(key);
  } catch (error) {
    logger.error(`Redis get failed for key ${key}: ${(error as Error).message}`);
    return null;
  }
}

async function safeDel(key: string) {
  try {
    return await redis.del(key);
  } catch (error) {
    logger.error(`Redis del failed for key ${key}: ${(error as Error).message}`);
  }
}

export { redis, safeSet, safeGet, safeDel };
