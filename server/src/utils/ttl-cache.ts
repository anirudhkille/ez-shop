export interface TtlCache<T> {
  load: (loader: () => Promise<T>) => Promise<T>;
  clear: () => void;
}

export const createTtlCache = <T>(ttlMs: number): TtlCache<T> => {
  let value: T | undefined;
  let expiresAt = 0;
  let generation = 0;
  let inFlight: Promise<T> | null = null;

  return {
    clear: () => {
      value = undefined;
      expiresAt = 0;
      generation += 1;
      inFlight = null;
    },

    load: (loader) => {
      if (value !== undefined && expiresAt > Date.now()) {
        return Promise.resolve(value);
      }

      if (!inFlight) {
        const startedAt = generation;

        inFlight = loader()
          .then((loaded) => {
            if (startedAt === generation) {
              value = loaded;
              expiresAt = Date.now() + ttlMs;
            }

            return loaded;
          })
          .finally(() => {
            if (startedAt === generation) inFlight = null;
          });
      }

      return inFlight;
    },
  };
};
