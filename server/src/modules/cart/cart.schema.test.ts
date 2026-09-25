import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  addToCartSchema,
  cartItemIdParamSchema,
  updateCartSchema,
} from "./cart.schema.js";

const productId = "507f1f77bcf86cd799439011";
const variantId = "507f191e810c19729de860ea";

describe("cart schemas", () => {
  it("accepts an add-item payload and defaults quantity", () => {
    const result = addToCartSchema.parse({ productId });
    assert.deepEqual(result, { productId, quantity: 1 });
    assert.equal(
      addToCartSchema.safeParse({
        productId,
        variantId,
        size: "M",
        quantity: 10,
      }).success,
      true,
    );
  });

  it("rejects invalid product ids and quantities", () => {
    assert.equal(
      addToCartSchema.safeParse({ productId: "bad" }).success,
      false,
    );
    assert.equal(
      addToCartSchema.safeParse({ productId, quantity: 0 }).success,
      false,
    );
    assert.equal(
      addToCartSchema.safeParse({ productId, quantity: 11 }).success,
      false,
    );
    assert.equal(
      addToCartSchema.safeParse({ productId, quantity: 1.5 }).success,
      false,
    );
  });

  it("validates quantity updates and cart item params", () => {
    assert.equal(
      updateCartSchema.safeParse({ cartItemId: productId, quantity: 2 })
        .success,
      true,
    );
    assert.equal(
      updateCartSchema.safeParse({ cartItemId: "bad", quantity: 2 }).success,
      false,
    );
    assert.equal(
      updateCartSchema.safeParse({ cartItemId: productId, quantity: 0 })
        .success,
      false,
    );
    assert.equal(
      cartItemIdParamSchema.safeParse({ cartItemId: productId }).success,
      true,
    );
  });
});
