import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { computeDiscount } from "./coupon.service.js";

const percentage = (value: number, maxDiscountAmount?: number) => ({
  type: "percentage" as const,
  value,
  maxDiscountAmount,
});

const fixed = (value: number, maxDiscountAmount?: number) => ({
  type: "fixed" as const,
  value,
  maxDiscountAmount,
});

describe("computeDiscount", () => {
  it("takes a percentage off the subtotal", () => {
    assert.equal(computeDiscount(percentage(10), 1000), 100);
    assert.equal(computeDiscount(percentage(25), 800), 200);
  });

  it("rounds to two decimal places", () => {
    // 33% of 99.99 is 32.9967
    assert.equal(computeDiscount(percentage(33), 99.99), 33);
    // 10% of 19.99 is 1.999
    assert.equal(computeDiscount(percentage(10), 19.99), 2);
  });

  it("takes a flat amount off the subtotal", () => {
    assert.equal(computeDiscount(fixed(150), 1000), 150);
  });

  it("never discounts more than the subtotal", () => {
    assert.equal(computeDiscount(fixed(500), 200), 200);
    assert.equal(computeDiscount(percentage(90), 100), 90);
  });

  it("caps a percentage at maxDiscountAmount", () => {
    // 50% of 2000 is 1000, capped down to 500
    assert.equal(computeDiscount(percentage(50, 500), 2000), 500);
    // Under the cap the percentage is untouched
    assert.equal(computeDiscount(percentage(10, 500), 2000), 200);
  });

  it("caps a fixed amount at maxDiscountAmount", () => {
    assert.equal(computeDiscount(fixed(900, 300), 2000), 300);
  });

  it("returns zero for a zero subtotal", () => {
    assert.equal(computeDiscount(percentage(50), 0), 0);
    assert.equal(computeDiscount(fixed(100), 0), 0);
  });

  it("returns zero rather than a negative discount", () => {
    assert.equal(computeDiscount(percentage(10), 0), 0);
  });
});
