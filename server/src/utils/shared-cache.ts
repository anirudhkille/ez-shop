import { logger } from "@/config/logger";
import { createTtlCache } from "@/utils/ttl-cache";

export interface RedisCacheStore {
  get: <T>(key: string) => Promise<T | null>;
  set: (
    key: string,
    value: unknown,
    options: { ex: number },
  ) => Promise<unknown>;
  del: (key: string) => Promise<unknown>;
}

export interface SharedCacheLogger {
  warn: (payload: Record<string, unknown>, message?: string) => void;
}

export interface SharedCache<T> {
  load: (loader: () => Promise<T>) => Promise<T>;
  clear: () => Promise<void>;
}

const defaultLogger: SharedCacheLogger = {
  warn: (payload, message) => logger.warn(payload, message),
};

/**
 * A Redis-backed cache with an in-process TTL cache underneath it. Redis is
 * optional: when it is not configured or fails, reads and writes fall back to
 * the local cache so callers keep working.
 */
export const createSharedCache = <T>(
  key: string,
  ttlSeconds: number,
  store: RedisCacheStore | null,
  cacheLogger: SharedCacheLogger = defaultLogger,
): SharedCache<T> => {
  const local = createTtlCache<T>(ttlSeconds * 1000);
  let generation = 0;

  return {
    async load(loader) {
      const localValue = local.peek();
      if (localValue !== undefined) return localValue;

      if (store) {
        try {
          const cached = await store.get<T>(key);

          if (cached !== null) {
            local.prime(cached);
            return cached;
          }
        } catch (error) {
          cacheLogger.warn(
            {
              err: error instanceof Error ? error.message : String(error),
              key,
            },
            "Redis cache read failed; using local cache",
          );
        }
      }

      const startedAt = generation;
      const value = await local.load(loader);

      if (store && startedAt === generation) {
        try {
          await store.set(key, value, { ex: ttlSeconds });
        } catch (error) {
          cacheLogger.warn(
            {
              err: error instanceof Error ? error.message : String(error),
              key,
            },
            "Redis cache write failed; local cache still holds the value",
          );
        }
      }

      return value;
    },

    async clear() {
      generation += 1;
      local.clear();

      if (!store) return;

      const deleteKey = async () => {
        try {
          await store.del(key);
        } catch (error) {
          cacheLogger.warn(
            {
              err: error instanceof Error ? error.message : String(error),
              key,
            },
            "Redis cache delete failed; the key will expire on its ttl",
          );
        }
      };

      await deleteKey();

      // A second delete after a short delay closes the cross-instance window
      // where another instance could write a stale value after our first DEL.
      const timer = setTimeout(() => void deleteKey(), 1000);
      timer.unref?.();
    },
  };
};
