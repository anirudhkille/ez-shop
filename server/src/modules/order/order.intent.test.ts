import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  deliveryChargeFor,
  subtotalOf,
  toOrderLines,
  totalFor,
  type PricedLine,
} from "./order.intent.js";

const line = (over: Partial<PricedLine> = {}): PricedLine => ({
  product: "507f191e810c19729de860ea",
  quantity: 1,
  price: 100,
  name: "Tee",
  image: "tee.png",
  ...over,
});

describe("deliveryChargeFor", () => {
  it("charges nothing for standard delivery", () => {
    assert.equal(deliveryChargeFor("standard"), 0);
  });

  it("charges a flat rate per speed", () => {
    assert.equal(deliveryChargeFor("express"), 120);
    assert.equal(deliveryChargeFor("same-day"), 199);
  });

  it("treats an unrecognised method as free rather than throwing", () => {
    // The enum rejects these at the schema, but the total is computed before
    // the order is saved, so an odd value must not produce a NaN total.
    assert.equal(deliveryChargeFor("teleport"), 0);
    assert.equal(deliveryChargeFor(""), 0);
  });
});

describe("subtotalOf", () => {
  it("multiplies each line price by its quantity", () => {
    assert.equal(
      subtotalOf([line({ price: 250, quantity: 3 }), line({ price: 99 })]),
      849,
    );
  });

  it("is zero for no lines", () => {
    assert.equal(subtotalOf([]), 0);
  });
});

describe("totalFor", () => {
  it("adds delivery to the discounted subtotal", () => {
    assert.equal(totalFor(1000, 100, 120), 1020);
  });

  it("never goes below the delivery charge", () => {
    // computeDiscount already caps the discount at the subtotal, so this is a
    // guard rather than a reachable case — but a negative total would be
    // refused by Stripe and mismatched against the stored order.
    assert.equal(totalFor(500, 900, 120), 120);
    assert.equal(totalFor(500, 500, 120), 120);
  });

  it("ignores delivery when it is free", () => {
    assert.equal(totalFor(1000, 0, 0), 1000);
  });
});

describe("toOrderLines", () => {
  it("keeps the variant and size the stock was decremented for", () => {
    const [saved] = toOrderLines([
      line({ variantId: "507f191e810c19729de860eb", size: "M" }),
    ]);

    assert.deepEqual(saved, {
      product: "507f191e810c19729de860ea",
      quantity: 1,
      price: 100,
      variantId: "507f191e810c19729de860eb",
      size: "M",
    });
  });

  it("omits variant and size for a product that has neither", () => {
    const [saved] = toOrderLines([line()]);

    assert.equal("variantId" in saved, false);
    assert.equal("size" in saved, false);
  });

  it("does not mutate the priced lines it was given", () => {
    const original = line({ variantId: "abc", size: "L" });
    toOrderLines([original]);

    assert.equal(original.product, "507f191e810c19729de860ea");
    assert.equal(original.size, "L");
  });
});
