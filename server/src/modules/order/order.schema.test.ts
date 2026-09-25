import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  addressDeliverySchema,
  guestCheckoutSchema,
  orderIdParamSchema,
  orderStatusUpdateSchema,
  sessionIdParamSchema,
} from "./order.schema.js";

const productId = "507f1f77bcf86cd799439011";
const addressId = "507f191e810c19729de860ea";
const orderId = "507f1f77bcf86cd799439012";

const validGuestCheckout = {
  products: [{ productId, quantity: 1, size: "M" }],
  address: {
    name: "Ada Lovelace",
    addressLine1: "1 Main Street",
    city: "Mumbai",
    state: "Maharashtra",
    zipCode: "400001",
    country: "India",
    phone: "9999999999",
  },
  deliveryMethod: "standard",
  name: "Ada Lovelace",
  email: "ada@example.com",
  phone: "9999999999",
};

describe("order schemas", () => {
  it("validates authenticated checkout references", () => {
    assert.equal(
      addressDeliverySchema.safeParse({ addressId, deliveryMethod: "express" })
        .success,
      true,
    );
    assert.equal(
      addressDeliverySchema.safeParse({
        addressId: "bad",
        deliveryMethod: "express",
      }).success,
      false,
    );
  });

  it("validates guest checkout products and delivery data", () => {
    assert.equal(
      guestCheckoutSchema.safeParse(validGuestCheckout).success,
      true,
    );
    assert.equal(
      guestCheckoutSchema.safeParse({
        ...validGuestCheckout,
        products: [{ productId, quantity: 11 }],
      }).success,
      false,
    );
    assert.equal(
      guestCheckoutSchema.safeParse({
        ...validGuestCheckout,
        deliveryMethod: "overnight",
      }).success,
      false,
    );
  });

  it("restricts status updates and rejects an empty patch", () => {
    assert.equal(
      orderStatusUpdateSchema.safeParse({
        orderStatus: "shipped",
        paymentStatus: "paid",
      }).success,
      true,
    );
    assert.equal(orderStatusUpdateSchema.safeParse({}).success, false);
    assert.equal(
      orderStatusUpdateSchema.safeParse({ orderStatus: "cancelled" }).success,
      false,
    );
    assert.equal(
      orderStatusUpdateSchema.safeParse({ paymentStatus: "refunded" }).success,
      false,
    );
  });

  it("validates order and session params", () => {
    assert.equal(orderIdParamSchema.safeParse({ id: orderId }).success, true);
    assert.equal(orderIdParamSchema.safeParse({ id: "bad" }).success, false);
    assert.equal(
      sessionIdParamSchema.safeParse({ sessionId: "cs_test_123" }).success,
      true,
    );
    assert.equal(
      sessionIdParamSchema.safeParse({ sessionId: " " }).success,
      false,
    );
  });
});
