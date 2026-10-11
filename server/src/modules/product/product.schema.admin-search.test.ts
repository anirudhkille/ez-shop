import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { productQuerySchema } from "./product.schema.js";
import { orderPaginationQuerySchema } from "../order/order.schema.js";

describe("admin list query schemas", () => {
  it("accepts a search term on the product list", () => {
    const result = productQuerySchema.parse({ search: "  sneaker  " });
    assert.equal(result.search, "sneaker");
    assert.equal(productQuerySchema.safeParse({}).success, true);
    assert.equal(
      productQuerySchema.safeParse({ search: "x".repeat(121) }).success,
      false,
    );
  });

  it("accepts the product filters the admin toolbar sends", () => {
    const result = productQuerySchema.parse({
      publish: "true",
      gender: "women",
      category: "abc123",
    });
    assert.equal(result.publish, "true");
    assert.equal(result.gender, "women");
    assert.equal(
      productQuerySchema.safeParse({ gender: "nope" }).success,
      false,
    );
  });

  it("accepts a search term and status filters on the order list", () => {
    const result = orderPaginationQuerySchema.parse({
      search: "Mumbai",
      orderStatus: "delivered",
      paymentStatus: "paid",
    });
    assert.equal(result.search, "Mumbai");
    assert.equal(result.orderStatus, "delivered");
    assert.equal(result.paymentStatus, "paid");
    assert.equal(orderPaginationQuerySchema.safeParse({}).success, true);
    assert.equal(
      orderPaginationQuerySchema.safeParse({ orderStatus: "nope" }).success,
      false,
    );
  });

  it("only accepts order statuses the model can actually store", () => {
    // The Order model's orderStatus enum has no "cancelled", so filtering by
    // it would always return zero rows rather than an error.
    assert.equal(
      orderPaginationQuerySchema.safeParse({ orderStatus: "cancelled" })
        .success,
      false,
    );

    for (const status of ["processing", "shipped", "delivered"]) {
      assert.equal(
        orderPaginationQuerySchema.safeParse({ orderStatus: status }).success,
        true,
      );
    }
  });
});
