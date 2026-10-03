import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { resolveSort } from "./product.service.js";

const SORTS = ["featured", "rating", "newest", "price-low", "price-high"];
const ALL = [...SORTS, undefined, "nonsense"];

describe("resolveSort", () => {
  it("always ends on _id so the ordering is total", () => {
    for (const sort of ALL) {
      const option = resolveSort(sort);
      const keys = Object.keys(option);

      assert.equal(
        keys[keys.length - 1],
        "_id",
        `sort "${sort}" must be tiebroken by _id, got ${keys.join(",")}`,
      );
    }
  });

  it("uses a single unique key for every supported sort", () => {
    for (const sort of SORTS) {
      assert.equal(resolveSort(sort)._id, 1);
    }
  });

  it("keeps the featured sort meaning featured-first", () => {
    assert.deepEqual(resolveSort("featured"), { isFeatured: -1, _id: 1 });
  });

  it("does not lead the price sorts on discountPrice", () => {
    // Most products carry no discountPrice, so leading on it left the ordering
    // to MongoDB's handling of missing values.
    assert.equal(Object.keys(resolveSort("price-low"))[0], "price");
    assert.equal(Object.keys(resolveSort("price-high"))[0], "price");
  });

  it("falls back to newest for an unknown sort", () => {
    assert.deepEqual(resolveSort("nonsense"), { createdAt: -1, _id: 1 });
    assert.deepEqual(resolveSort(undefined), { createdAt: -1, _id: 1 });
  });

  it("returns a fresh object each call so callers cannot mutate the map", () => {
    const first = resolveSort("featured");
    first.isFeatured = 1;

    assert.equal(resolveSort("featured").isFeatured, -1);
  });
});
