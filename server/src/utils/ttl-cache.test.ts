import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { createTtlCache } from "./ttl-cache.js";

const createLoader = () => {
  let calls = 0;

  return {
    calls: () => calls,
    load: async () => {
      calls += 1;
      return calls;
    },
  };
};

describe("createTtlCache", () => {
  it("serves from the cache within the ttl", async () => {
    const cache = createTtlCache<number>(1000);
    const loader = createLoader();

    assert.equal(await cache.load(loader.load), 1);
    assert.equal(await cache.load(loader.load), 1);
    assert.equal(loader.calls(), 1);
  });

  it("reloads once the ttl has passed", async () => {
    const cache = createTtlCache<number>(1);
    const loader = createLoader();

    assert.equal(await cache.load(loader.load), 1);
    await new Promise((resolve) => setTimeout(resolve, 20));
    assert.equal(await cache.load(loader.load), 2);
    assert.equal(loader.calls(), 2);
  });

  it("shares a single load between concurrent misses", async () => {
    const cache = createTtlCache<number>(1000);
    let calls = 0;
    const load = async () => {
      calls += 1;
      await new Promise((resolve) => setTimeout(resolve, 5));
      return calls;
    };

    const results = await Promise.all([
      cache.load(load),
      cache.load(load),
      cache.load(load),
    ]);

    assert.deepEqual(results, [1, 1, 1]);
    assert.equal(calls, 1);
  });

  it("drops the cached value on clear", async () => {
    const cache = createTtlCache<number>(1000);
    const loader = createLoader();

    assert.equal(await cache.load(loader.load), 1);
    cache.clear();
    assert.equal(await cache.load(loader.load), 2);
    assert.equal(loader.calls(), 2);
  });

  it("does not let a load started before clear repopulate the cache", async () => {
    const cache = createTtlCache<number>(1000);
    let calls = 0;
    const load = async () => {
      calls += 1;
      await new Promise((resolve) => setTimeout(resolve, 5));
      return calls;
    };

    const pending = cache.load(load);
    cache.clear();
    assert.equal(await pending, 1);

    assert.equal(await cache.load(load), 2);
    assert.equal(calls, 2);
  });
});
