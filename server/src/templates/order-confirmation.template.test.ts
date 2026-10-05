import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { orderConfirmationTemplate } from "./order-confirmation.template.js";

const base = {
  id: "507f191e810c19729de860ea1234",
  name: "Anirudh",
  items: [{ name: "Cotton Tee", quantity: 2, price: 500 }],
  subtotal: 1000,
  total: 1120,
  deliveryCharge: 120,
  deliveryMethod: "express",
  paymentType: "cod",
};

describe("orderConfirmationTemplate", () => {
  it("shows the short order reference and the greeting", () => {
    const html = orderConfirmationTemplate(base, "https://shop.test/track");

    assert.match(html, /Thanks for your order/);
    assert.match(html, /Hi <strong>Anirudh<\/strong>/);
    assert.match(html, /#EA1234/);
  });

  it("multiplies unit price by quantity", () => {
    const html = orderConfirmationTemplate(base, "https://shop.test/track");

    assert.match(html, /Cotton Tee/);
    assert.match(html, /&times; 2/);
    assert.match(html, /\u20b91000\.00/);
  });

  it("renders the delivery charge and the total", () => {
    const html = orderConfirmationTemplate(base, "https://shop.test/track");

    assert.match(html, /Delivery \(express\)/);
    assert.match(html, /\u20b91120\.00/);
  });

  it("names the coupon on the discount row when there is one", () => {
    const html = orderConfirmationTemplate(
      { ...base, discount: 200, couponCode: "SAVE20" },
      "https://shop.test/track",
    );

    assert.match(html, /Discount \(SAVE20\)/);
    assert.match(html, /- \u20b9200\.00/);
  });

  it("omits the discount row entirely when there is no discount", () => {
    const html = orderConfirmationTemplate(base, "https://shop.test/track");

    assert.doesNotMatch(html, /Discount/);
  });

  it("omits the delivery row when delivery is free", () => {
    const html = orderConfirmationTemplate(
      { ...base, deliveryCharge: 0, total: 1000 },
      "https://shop.test/track",
    );

    assert.doesNotMatch(html, /Delivery/);
    assert.match(html, /\u20b91000\.00/);
  });

  it("includes the shipping address when there is one", () => {
    const html = orderConfirmationTemplate(
      {
        ...base,
        address: {
          name: "Anirudh Kille",
          addressLine1: "12 MG Road",
          addressLine2: "Near Metro",
          city: "Bengaluru",
          state: "KA",
          zipCode: "560001",
          country: "India",
        },
      },
      "https://shop.test/track",
    );

    assert.match(html, /Shipping address/);
    assert.match(html, /12 MG Road, Near Metro/);
    assert.match(html, /Bengaluru, KA 560001/);
  });

  it("omits the address block when the order has no address", () => {
    const html = orderConfirmationTemplate(base, "https://shop.test/track");

    assert.doesNotMatch(html, /Shipping address/);
  });

  it("links to the tracking page it is given", () => {
    const html = orderConfirmationTemplate(
      base,
      "https://shop.test/track-order",
    );

    assert.match(html, /href="https:\/\/shop\.test\/track-order"/);
  });

  it("spells out how the order is being paid for", () => {
    const cod = orderConfirmationTemplate(base, "t");
    const card = orderConfirmationTemplate(
      { ...base, paymentType: "card" },
      "t",
    );

    assert.match(cod, /cash on delivery/);
    assert.match(card, /Paying by card/);
  });

  it("survives a missing subtotal rather than printing NaN", () => {
    const html = orderConfirmationTemplate(
      { ...base, subtotal: undefined as never, total: undefined as never },
      "t",
    );

    assert.doesNotMatch(html, /NaN/);
    assert.match(html, /\u20b90\.00/);
  });
});
