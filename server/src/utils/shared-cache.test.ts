import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  createSharedCache,
  type RedisCacheStore,
  type SharedCacheLogger,
} from "./shared-cache.js";

class FakeStore implements RedisCacheStore {
  readonly deleted: string[] = [];
  readonly reads: string[] = [];
  readonly writes: { key: string; ttl: number; value: unknown }[] = [];
  failGet = false;
  failSet = false;
  value: unknown = null;

  async get<T>(key: string): Promise<T | null> {
    this.reads.push(key);

    if (this.failGet) throw new Error("redis get failed");

    return this.value as T | null;
  }

  async set(key: string, value: unknown, options: { ex: number }) {
    if (this.failSet) throw new Error("redis set failed");

    this.writes.push({ key, ttl: options.ex, value });
    this.value = value;
  }

  async del(key: string) {
    this.deleted.push(key);
    this.value = null;
  }
}

const silentLogger: SharedCacheLogger = {
  warn: () => {},
};

const key = "ez-shop:test:categories";
const ttlSeconds = 300;

describe("createSharedCache", () => {
  it("returns a Redis hit without calling the loader", async () => {
    const store = new FakeStore();
    store.value = ["cached"];
    let loads = 0;
    const cache = createSharedCache<string[]>(
      key,
      ttlSeconds,
      store,
      silentLogger,
    );

    const result = await cache.load(async () => {
      loads += 1;
      return ["fresh"];
    });

    assert.deepEqual(result, ["cached"]);
    assert.equal(loads, 0);
    assert.deepEqual(store.reads, [key]);
  });

  it("loads on a miss and stores the value with the requested ttl", async () => {
    const store = new FakeStore();
    let loads = 0;
    const cache = createSharedCache<string[]>(
      key,
      ttlSeconds,
      store,
      silentLogger,
    );

    const result = await cache.load(async () => {
      loads += 1;
      return ["fresh"];
    });

    assert.deepEqual(result, ["fresh"]);
    assert.equal(loads, 1);
    assert.deepEqual(store.writes, [
      { key, ttl: ttlSeconds, value: ["fresh"] },
    ]);
  });

  it("falls back to loading when Redis reads fail", async () => {
    const store = new FakeStore();
    store.failGet = true;
    const warnings: unknown[] = [];
    const cache = createSharedCache<string[]>(key, ttlSeconds, store, {
      warn: (payload) => warnings.push(payload),
    });

    const result = await cache.load(async () => ["fresh"]);

    assert.deepEqual(result, ["fresh"]);
    assert.equal(warnings.length, 1);
  });

  it("keeps serving when Redis writes fail", async () => {
    const store = new FakeStore();
    store.failSet = true;
    const warnings: unknown[] = [];
    const cache = createSharedCache<string[]>(key, ttlSeconds, store, {
      warn: (payload) => warnings.push(payload),
    });

    const result = await cache.load(async () => ["fresh"]);

    assert.deepEqual(result, ["fresh"]);
    assert.equal(warnings.length, 1);
  });

  it("clears both the local cache and the Redis key", async () => {
    const store = new FakeStore();
    let loads = 0;
    const cache = createSharedCache<string[]>(
      key,
      ttlSeconds,
      store,
      silentLogger,
    );

    await cache.load(async () => {
      loads += 1;
      return ["first"];
    });
    await cache.clear();
    const result = await cache.load(async () => {
      loads += 1;
      return ["second"];
    });

    assert.deepEqual(result, ["second"]);
    assert.equal(loads, 2);
    assert.deepEqual(store.deleted, [key]);
  });

  it("uses the local cache when Redis is not configured", async () => {
    let loads = 0;
    const cache = createSharedCache<string[]>(
      key,
      ttlSeconds,
      null,
      silentLogger,
    );

    const first = await cache.load(async () => {
      loads += 1;
      return ["fresh"];
    });
    const second = await cache.load(async () => {
      loads += 1;
      return ["other"];
    });

    assert.deepEqual(first, ["fresh"]);
    assert.deepEqual(second, ["fresh"]);
    assert.equal(loads, 1);
  });
});
