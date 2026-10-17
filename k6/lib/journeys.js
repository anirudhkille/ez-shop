import { sleep } from "k6";

import { THINK_MAX, THINK_MIN } from "./config.js";
import { del, get, parse, post, put } from "./client.js";
import { statusIn, statusIs } from "./checks.js";
import { journeyDuration } from "./metrics.js";
import { SEARCH_TERMS, guestOrderPayload, pick, randomInt } from "./data.js";

export function think() {
  sleep(THINK_MIN + Math.random() * Math.max(0, THINK_MAX - THINK_MIN));
}

const SORTS = ["price-low", "price-high", "newest", "featured", "rating"];
const GENDERS = ["men", "women", "unisex"];

/**
 * Anonymous visitor: home page, listing, filter/search, product detail.
 * Read-only, so it can be run at any volume without polluting the database.
 */
export function browseJourney(catalog, tags = {}) {
  const started = Date.now();

  // Home page
  statusIs(
    get("/product/featured", { name: "GET /product/featured", tags }),
    200,
    "featured",
  );
  statusIs(
    get("/product/best-sellers", { name: "GET /product/best-sellers", tags }),
    200,
    "best-sellers",
  );
  statusIs(
    get("/category", { query: { limit: 20 }, name: "GET /category", tags }),
    200,
    "categories",
  );
  think();

  // Catalogue listing, a few pages deep
  statusIs(
    get("/product", {
      query: { publish: "true", page: randomInt(1, 3), limit: 12 },
      name: "GET /product",
      tags,
    }),
    200,
    "product list",
  );
  think();

  // Narrow down by filter or by search
  const roll = Math.random();

  if (roll < 0.45) {
    statusIs(
      get("/product/filter", {
        query: {
          sort: pick(SORTS),
          gender: pick(GENDERS),
          price: "0-100000",
          page: 1,
          limit: 20,
        },
        name: "GET /product/filter",
        tags,
      }),
      200,
      "filter",
    );
  } else if (roll < 0.8) {
    statusIs(
      get("/product/search", {
        query: { name: pick(SEARCH_TERMS), limit: 10 },
        name: "GET /product/search",
        tags,
      }),
      200,
      "search",
    );
  }

  // Product detail page (+ related items and reviews)
  if (catalog.products.length > 0) {
    think();

    const product = pick(catalog.products);

    statusIs(
      get(`/product/${product.slug}/${product.id}`, {
        name: "GET /product/:slug/:id",
        tags,
      }),
      200,
      "product detail",
    );

    if (Math.random() < 0.6) {
      statusIs(
        get(`/product/similar/${product.id}`, {
          name: "GET /product/similar/:id",
          tags,
        }),
        200,
        "similar products",
      );
    }

    if (Math.random() < 0.5) {
      statusIs(
        get(`/review/${product.id}`, {
          query: { page: 1, limit: 10 },
          name: "GET /review/:productId",
          tags,
        }),
        200,
        "product reviews",
      );
    }
  }

  journeyDuration.add(Date.now() - started, { journey: "browse" });
}

/**
 * Signed-in customer: cart, wishlist, account reads.
 *
 * All VUs share one account (the auth limiter forbids logging in per VU), so
 * cart writes from different VUs touch the same cart. Concurrent collisions
 * surface as 400/404 and are tolerated; only 5xx responses count as failures.
 */
export function shopperJourney(token, catalog, tags = {}) {
  const started = Date.now();

  statusIs(
    get("/user/profile", { token, name: "GET /user/profile", tags }),
    200,
    "profile",
  );
  statusIs(
    get("/cart/count", { token, name: "GET /cart/count", tags }),
    200,
    "cart count",
  );

  if (catalog.products.length > 0) {
    const product = pick(catalog.products);

    const added = post("/cart", {
      token,
      body: { productId: product.id, quantity: 1 },
      name: "POST /cart",
      expect: [200, 400],
      tags,
    });
    statusIn(added, [200, 400], "add to cart");

    const addedBody = parse(added);
    const items =
      added.status === 200 && addedBody && addedBody.data
        ? addedBody.data.products || []
        : [];
    const line = items.length > 0 ? items[items.length - 1] : null;

    think();

    statusIs(get("/cart", { token, name: "GET /cart", tags }), 200, "cart");

    if (line) {
      statusIn(
        put("/cart", {
          token,
          body: { cartItemId: line._id, quantity: 2 },
          name: "PUT /cart",
          expect: [200, 400, 404],
          tags,
        }),
        [200, 400, 404],
        "update cart quantity",
      );

      statusIn(
        del(`/cart/${line._id}`, {
          token,
          name: "DELETE /cart/:cartItemId",
          expect: [200, 404],
          tags,
        }),
        [200, 404],
        "remove from cart",
      );
    }

    // Toggle twice so the wishlist ends where it started.
    for (let i = 0; i < 2; i++) {
      statusIs(
        post("/wishlist/toggle", {
          token,
          body: { productId: product.id },
          name: "POST /wishlist/toggle",
          tags,
        }),
        200,
        "wishlist toggle",
      );
    }
  }

  statusIs(
    get("/wishlist/details", { token, name: "GET /wishlist/details", tags }),
    200,
    "wishlist details",
  );
  statusIs(
    get("/address", { token, name: "GET /address", tags }),
    200,
    "addresses",
  );
  statusIs(
    get("/order/my-orders", {
      token,
      query: { page: 1, limit: 10 },
      name: "GET /order/my-orders",
      tags,
    }),
    200,
    "my orders",
  );

  journeyDuration.add(Date.now() - started, { journey: "shopper" });
}

/** Admin dashboard: the aggregation-heavy read endpoints. */
export function adminJourney(token, tags = {}) {
  const started = Date.now();

  statusIs(
    get("/order/stats", { token, name: "GET /order/stats", tags }),
    200,
    "order stats",
  );
  statusIs(
    get("/order", {
      token,
      query: { page: 1, limit: 10 },
      name: "GET /order",
      tags,
    }),
    200,
    "order list",
  );
  statusIs(
    get("/user", {
      token,
      query: { page: 1, limit: 10 },
      name: "GET /user",
      tags,
    }),
    200,
    "user list",
  );
  statusIs(
    get("/coupon", {
      token,
      query: { page: 1, limit: 10 },
      name: "GET /coupon",
      tags,
    }),
    200,
    "coupon list",
  );
  statusIs(
    get("/newsletter", {
      token,
      query: { page: 1, limit: 10 },
      name: "GET /newsletter",
      tags,
    }),
    200,
    "newsletter list",
  );

  journeyDuration.add(Date.now() - started, { journey: "admin" });
}

/**
 * Guest checkout with cash on delivery. WRITE-HEAVY: creates an order and an
 * invoice, decrements stock and sends a confirmation email per iteration.
 * Only wired in when ENABLE_ORDERS=true.
 */
export function guestCheckoutJourney(catalog, tags = {}) {
  const started = Date.now();

  if (catalog.products.length === 0) return;

  const product = pick(catalog.products);
  const line = { productId: product.id, quantity: 1 };

  const res = post("/order/guest", {
    body: guestOrderPayload([line]),
    name: "POST /order/guest",
    expect: [201, 400],
    tags,
  });
  statusIn(res, [201, 400], "guest COD order");

  const body = parse(res);

  if (res.status === 201 && body && body.data && body.data.orderId) {
    statusIs(
      get(`/order/order-id/${body.data.orderId}`, {
        name: "GET /order/order-id/:id",
        tags,
      }),
      200,
      "order receipt",
    );
  }

  journeyDuration.add(Date.now() - started, { journey: "guest_checkout" });
}
