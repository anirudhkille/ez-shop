import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  categoryCreateSchema,
  categoryUpdateSchema,
} from "./category.schema.js";

describe("category schemas", () => {
  it("allows a category create without a body image when a file is uploaded", () => {
    const result = categoryCreateSchema.safeParse({
      name: "Shoes",
      slug: "shoes",
    });

    assert.equal(result.success, true);
  });

  it("requires a non-empty partial update", () => {
    assert.equal(categoryUpdateSchema.safeParse({ name: "Sneakers" }).success, true);
    assert.equal(categoryUpdateSchema.safeParse({}).success, false);
  });
});
