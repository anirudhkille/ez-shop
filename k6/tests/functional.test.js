// FUNCTIONAL / API CONTRACT: one VU, one iteration, every module.
//
// Exercises each endpoint's happy path, input validation, authorisation and
// edge cases, and checks the response envelope and error codes. Everything it
// creates (category, products, coupons, addresses, orders, reviews) is removed
// again in a finally block, even when a check fails part-way through.
//
// What runs depends on what you pass in:
//   no credentials          -> platform + public catalogue
//   USER_*                  -> + customer account, cart, wishlist, addresses
//   ADMIN_*                 -> + catalogue/coupon management, admin reads
//   USER_* + ADMIN_* + ENABLE_ORDERS=true -> + checkout, invoices, reviews
//
// Auth-limiter budget (10 per 15 min per IP): setup() spends 2 logins and the
// negative auth tests spend 3 more. Pass USER_TOKEN / ADMIN_TOKEN to skip the
// logins, or AUTH_NEGATIVE_TESTS=false to skip the negatives.

import { check, group } from "k6";

import { FLAGS, USER } from "../lib/config.js";
import { assertServerReachable } from "../lib/preflight.js";
import { authenticate } from "../lib/auth.js";
import { del, get, header, parse, patch, post, put, request } from "../lib/client.js";
import {
  assert,
  expectError,
  expectOk,
  expectPagination,
  finding,
} from "../lib/checks.js";
import {
  FAKE_ID,
  categoryPayload,
  couponPayload,
  guestOrderPayload,
  productPayload,
  savedAddressPayload,
  shippingAddress,
  uid,
  uniqueEmail,
} from "../lib/data.js";

export const options = {
  vus: 1,
  iterations: 1,
  thresholds: {
    checks: ["rate==1"],
    http_req_failed: ["rate==0"],
    server_error_responses: ["count==0"],
    rate_limited_responses: ["count==0"],
  },
};

export function setup() {
  assertServerReachable();

  const auth = authenticate({ user: true, admin: true });

  return {
    userToken: auth.user && auth.user.token,
    adminToken: auth.admin && auth.admin.token,
  };
}

export default function (data) {
  const state = {
    categoryId: null,
    categorySlug: null,
    product: null, // { id, slug, name, stock }
    ownsProduct: false,
    lowStockId: null,
    couponIds: [],
    addressIds: [],
    orderIds: [],
    reviewId: null,
  };

  try {
    group("platform", () => platform());

    if (data.adminToken) {
      group("admin: category management", () => adminCategories(data, state));
      group("admin: product management", () => adminProducts(data, state));
    }

    ensureProduct(state);

    group("public: catalogue", () => publicCatalogue(state));
    group("public: newsletter", () => newsletter());
    group("public: payment & webhook guards", () => paymentGuards(data));

    if (data.adminToken) {
      group("admin: coupons", () => adminCoupons(data, state));
      group("admin: dashboards & lists", () => adminReads(data));
    }

    if (data.userToken) {
      group("customer: account", () => customerAccount(data));
      group("customer: addresses", () => customerAddresses(data, state));
      group("customer: wishlist", () => customerWishlist(data, state));
      group("customer: cart", () => customerCart(data, state));
    }

    if (FLAGS.authNegative) {
      group("auth: negative cases", () => authNegatives(data));
    }

    if (data.userToken && data.adminToken && FLAGS.orders && state.ownsProduct) {
      group("checkout: COD order lifecycle", () => orderLifecycle(data, state));
      group("checkout: coupon at checkout", () => couponAtCheckout(data, state));
      group("checkout: guest order", () => guestOrder(data, state));
      group("reviews", () => reviews(data, state));
    } else if (FLAGS.orders) {
      console.warn(
        "ENABLE_ORDERS is set but checkout tests need USER_* and ADMIN_* credentials - skipped.",
      );
    }
  } finally {
    cleanup(data, state);
  }
}

// ---------------------------------------------------------------------------
// platform
// ---------------------------------------------------------------------------

function platform() {
  const res = get("/health", { name: "GET /health" });
  const body = expectOk(res, "health");

  assert("health: status is ok", body && body.data.status === "ok");
  assert("health: uptime is numeric", body && typeof body.data.uptime === "number");

  check(res, {
    "helmet: X-Content-Type-Options is nosniff": (r) =>
      header(r, "X-Content-Type-Options") === "nosniff",
    "helmet: X-Powered-By is not advertised": (r) =>
      header(r, "X-Powered-By") === undefined,
    "rate limit headers are advertised": (r) =>
      header(r, "RateLimit-Limit") !== undefined ||
      header(r, "RateLimit") !== undefined,
  });

  expectError(
    get("/this-route-does-not-exist", { name: "GET /unknown", expect: 404 }),
    404,
    "unknown route",
    "NOT_FOUND",
  );
}

// ---------------------------------------------------------------------------
// admin: categories
// ---------------------------------------------------------------------------

function adminCategories(data, state) {
  const token = data.adminToken;
  const payload = categoryPayload();

  const created = expectOk(
    post("/category", { token, body: payload, name: "POST /category" }),
    "create category",
    201,
  );

  if (!created) return;

  state.categoryId = created.data._id;
  state.categorySlug = created.data.slug;

  assert("create category: id returned", Boolean(state.categoryId));
  assert("create category: name stored", created.data.name === payload.name);
  assert("create category: slug stored", created.data.slug === payload.slug);

  const invalid = expectError(
    post("/category", {
      token,
      body: { name: "No slug" },
      name: "POST /category (invalid)",
      expect: 400,
    }),
    400,
    "create category without slug",
    "VALIDATION_ERROR",
  );
  assert(
    "create category without slug: reports the slug field",
    invalid &&
      Array.isArray(invalid.data.details) &&
      invalid.data.details.some((d) => d.field === "slug"),
  );

  const renamed = expectOk(
    patch(`/category/${state.categoryId}`, {
      token,
      body: { name: `${payload.name} renamed` },
      name: "PATCH /category/:id",
    }),
    "rename category",
  );
  assert(
    "rename category: new name stored",
    renamed && renamed.data.name === `${payload.name} renamed`,
  );
  assert(
    "rename category: slug is left untouched",
    renamed && renamed.data.slug === payload.slug,
  );

  expectError(
    patch(`/category/${state.categoryId}`, {
      token,
      body: {},
      name: "PATCH /category/:id (empty)",
      expect: 400,
    }),
    400,
    "update category with empty body",
    "VALIDATION_ERROR",
  );
  expectError(
    patch(`/category/${FAKE_ID}`, {
      token,
      body: { name: "Ghost" },
      name: "PATCH /category/:id (unknown)",
      expect: 404,
    }),
    404,
    "update unknown category",
  );
  expectError(
    patch("/category/not-an-id", {
      token,
      body: { name: "Bad" },
      name: "PATCH /category/:id (bad id)",
      expect: 400,
    }),
    400,
    "update category with malformed id",
    "VALIDATION_ERROR",
  );

  const list = expectOk(
    get("/category", { query: { limit: 100 }, name: "GET /category" }),
    "list categories",
  );
  expectPagination(list, "list categories", { page: 1, limit: 100 });
}

// ---------------------------------------------------------------------------
// admin: products
// ---------------------------------------------------------------------------

function adminProducts(data, state) {
  const token = data.adminToken;

  if (!state.categoryId) return;

  const payload = productPayload(state.categoryId);

  const created = expectOk(
    post("/product", { token, body: payload, name: "POST /product" }),
    "create product",
    201,
  );

  if (!created) return;

  const product = created.data;
  state.ownsProduct = true;
  state.product = {
    id: product._id,
    slug: product.slug,
    name: product.name,
    stock: product.stock,
  };

  assert(
    "create product: slug derived from the name",
    product.slug === payload.name.toLowerCase().replace(/\s+/g, "-"),
  );
  assert("create product: stock stored", product.stock === payload.stock);
  assert("create product: published by default", product.publish === true);
  assert("create product: starts with no rating", product.rating === 0);
  assert(
    "create product: variants stored",
    Array.isArray(product.variants) && product.variants.length === 1,
  );

  // --- validation
  [
    ["negative price", { price: -5 }],
    ["zero price", { price: 0 }],
    ["fractional stock", { stock: 1.5 }],
    ["negative stock", { stock: -1 }],
    ["malformed category id", { category: "nope" }],
    ["unknown gender", { gender: "robot" }],
    ["unknown tag", { tag: "Mystery" }],
  ].forEach(([label, override]) => {
    expectError(
      post("/product", {
        token,
        body: productPayload(state.categoryId, override),
        name: "POST /product (invalid)",
        expect: 400,
      }),
      400,
      `create product with ${label}`,
      "VALIDATION_ERROR",
    );
  });

  expectError(
    post("/product", {
      token,
      body: {},
      name: "POST /product (empty)",
      expect: 400,
    }),
    400,
    "create product with empty body",
    "VALIDATION_ERROR",
  );

  // --- partial update must not destroy data the caller did not mention
  const priced = expectOk(
    patch(`/product/${state.product.id}`, {
      token,
      body: { price: 1099 },
      name: "PATCH /product/:id",
    }),
    "update product price",
  );
  assert("update product price: new price stored", priced && priced.data.price === 1099);

  const afterPatch = parse(
    get(`/product/${state.product.slug}/${state.product.id}`, {
      name: "GET /product/:slug/:id",
    }),
  );
  assert(
    "partial update keeps existing variants (PATCH {price} must not wipe variants)",
    afterPatch && afterPatch.data.variants.length === 1,
  );

  expectError(
    patch(`/product/${state.product.id}`, {
      token,
      body: {},
      name: "PATCH /product/:id (empty)",
      expect: 400,
    }),
    400,
    "update product with empty body",
    "VALIDATION_ERROR",
  );
  expectError(
    patch(`/product/${FAKE_ID}`, {
      token,
      body: { price: 10 },
      name: "PATCH /product/:id (unknown)",
      expect: 404,
    }),
    404,
    "update unknown product",
  );

  // --- renaming regenerates the slug; the old URL must redirect to the new one
  const oldSlug = state.product.slug;
  const newName = `${state.product.name} Renamed`;
  const renamed = expectOk(
    patch(`/product/${state.product.id}`, {
      token,
      body: { name: newName },
      name: "PATCH /product/:id",
    }),
    "rename product",
  );

  if (renamed) {
    state.product.name = newName;
    state.product.slug = renamed.data.slug;
    assert("rename product: slug changed", renamed.data.slug !== oldSlug);
  }

  const redirected = expectOk(
    get(`/product/${oldSlug}/${state.product.id}`, {
      name: "GET /product/:slug/:id",
    }),
    "old slug still resolves",
  );
  assert(
    "old slug: response carries a redirectUrl to the new slug",
    redirected &&
      typeof redirected.data.redirectUrl === "string" &&
      redirected.data.redirectUrl.indexOf(state.product.slug) !== -1,
  );

  // --- authorisation
  expectError(
    post("/product", {
      body: payload,
      name: "POST /product (anonymous)",
      expect: 401,
    }),
    401,
    "create product without a token",
    "UNAUTHORIZED",
  );
}

// ---------------------------------------------------------------------------
// make sure there is a product to read, even without admin credentials
// ---------------------------------------------------------------------------

function ensureProduct(state) {
  if (state.product) return;

  const res = get("/product", {
    query: { publish: "true", limit: 1 },
    name: "GET /product",
  });
  const body = parse(res);

  if (res.status === 200 && body && body.data.length > 0) {
    const p = body.data[0];
    state.product = { id: p._id, slug: p.slug, name: p.name, stock: p.stock };
  } else {
    console.warn("No products exist and no admin credentials were given: product-specific checks are skipped.");
  }
}

// ---------------------------------------------------------------------------
// public catalogue
// ---------------------------------------------------------------------------

function publicCatalogue(state) {
  // --- pagination contract
  const page = expectOk(
    get("/product", {
      query: { publish: "true", page: 1, limit: 5 },
      name: "GET /product",
    }),
    "list products",
  );
  expectPagination(page, "list products", { page: 1, limit: 5 });

  [
    ["limit=0", { limit: 0 }],
    ["limit=101", { limit: 101 }],
    ["page=0", { page: 0 }],
    ["page=abc", { page: "abc" }],
  ].forEach(([label, query]) => {
    expectError(
      get("/product", { query, name: "GET /product (invalid)", expect: 400 }),
      400,
      `list products with ${label}`,
      "VALIDATION_ERROR",
    );
  });

  // --- the product we created is findable
  if (state.ownsProduct) {
    const uniquePart = state.product.name.split(" ")[2];
    const found = expectOk(
      get("/product", {
        query: { search: uniquePart, publish: "true" },
        name: "GET /product (search)",
      }),
      "list products by search term",
    );
    assert(
      "search by name finds exactly the created product",
      found &&
        found.data.length === 1 &&
        found.data[0]._id === state.product.id,
    );
  }

  // --- search term containing regex metacharacters must be taken literally
  expectOk(
    get("/product", {
      query: { search: "(a+)+$.*[" },
      name: "GET /product (regex search)",
    }),
    "list products with regex metacharacters in search",
  );

  // --- filter endpoint
  const filtered = expectOk(
    get("/product/filter", {
      query: {
        sort: "price-low",
        gender: "unisex",
        price: "0-100000",
        type: "New",
        page: 1,
        limit: 20,
      },
      name: "GET /product/filter",
    }),
    "filter products",
  );
  expectPagination(filtered, "filter products", { page: 1, limit: 20 });

  if (state.ownsProduct && state.categoryId) {
    const byCategory = expectOk(
      get("/product/filter", {
        query: { category: state.categoryId, size: "M", color: "Black" },
        name: "GET /product/filter",
      }),
      "filter products by category, size and colour",
    );
    assert(
      "filter by category/size/colour returns the created product",
      byCategory &&
        byCategory.data.some((p) => p._id === state.product.id),
    );
  }

  [
    ["unknown sort", { sort: "cheapest" }],
    ["malformed price range", { price: "abc" }],
    ["inverted price range", { price: "500-100" }],
    ["unknown gender", { gender: "alien" }],
    ["malformed category", { category: "nope" }],
    ["unknown type", { type: "Legendary" }],
    ["minRating above 5", { minRating: 6 }],
    ["limit above 100", { limit: 101 }],
  ].forEach(([label, query]) => {
    expectError(
      get("/product/filter", {
        query,
        name: "GET /product/filter (invalid)",
        expect: 400,
      }),
      400,
      `filter with ${label}`,
      "VALIDATION_ERROR",
    );
  });

  // --- search / featured / best sellers
  expectOk(
    get("/product/search", {
      query: { name: "shirt", limit: 5 },
      name: "GET /product/search",
    }),
    "search products",
  );
  expectError(
    get("/product/search", {
      name: "GET /product/search (no term)",
      expect: 400,
    }),
    400,
    "search without a term",
    "VALIDATION_ERROR",
  );
  expectError(
    get("/product/search", {
      query: { name: "x", limit: 51 },
      name: "GET /product/search (limit)",
      expect: 400,
    }),
    400,
    "search with limit above 50",
    "VALIDATION_ERROR",
  );

  const featured = expectOk(
    get("/product/featured", { name: "GET /product/featured" }),
    "featured products",
  );
  assert("featured: data is an array", featured && Array.isArray(featured.data));

  const best = expectOk(
    get("/product/best-sellers", { name: "GET /product/best-sellers" }),
    "best sellers",
  );
  assert("best sellers: data is an array", best && Array.isArray(best.data));

  // --- single product
  if (state.product) {
    const detail = expectOk(
      get(`/product/${state.product.slug}/${state.product.id}`, {
        name: "GET /product/:slug/:id",
      }),
      "product detail",
    );
    assert(
      "product detail: returns the requested product",
      detail && detail.data._id === state.product.id,
    );

    expectOk(
      get(`/product/similar/${state.product.id}`, {
        name: "GET /product/similar/:id",
      }),
      "similar products",
    );

    const reviews = expectOk(
      get(`/review/${state.product.id}`, {
        query: { page: 1, limit: 10 },
        name: "GET /review/:productId",
      }),
      "product reviews",
    );
    expectPagination(reviews, "product reviews", { page: 1, limit: 10 });
  }

  expectError(
    get("/product/some-slug/not-an-id", {
      name: "GET /product/:slug/:id (bad id)",
      expect: 400,
    }),
    400,
    "product detail with malformed id",
    "VALIDATION_ERROR",
  );
  expectError(
    get(`/product/some-slug/${FAKE_ID}`, {
      name: "GET /product/:slug/:id (unknown)",
      expect: 404,
    }),
    404,
    "product detail for unknown id",
  );
  expectError(
    get("/product/similar/not-an-id", {
      name: "GET /product/similar/:id (bad id)",
      expect: 400,
    }),
    400,
    "similar products with malformed id",
    "VALIDATION_ERROR",
  );
  expectError(
    get("/review/not-an-id", {
      name: "GET /review/:productId (bad id)",
      expect: 400,
    }),
    400,
    "reviews with malformed product id",
    "VALIDATION_ERROR",
  );

  // --- categories
  expectPagination(
    expectOk(
      get("/category", { query: { page: 1, limit: 5 }, name: "GET /category" }),
      "list categories",
    ),
    "list categories",
    { page: 1, limit: 5 },
  );
  expectError(
    get("/category", {
      query: { limit: 0 },
      name: "GET /category (invalid)",
      expect: 400,
    }),
    400,
    "list categories with limit=0",
    "VALIDATION_ERROR",
  );
}

// ---------------------------------------------------------------------------
// newsletter
// ---------------------------------------------------------------------------

function newsletter() {
  // There is no unsubscribe/delete endpoint, so each run leaves one
  // k6.*@example.test subscriber behind.
  const email = uniqueEmail();

  expectOk(
    post("/newsletter", { body: { email }, name: "POST /newsletter" }),
    "newsletter subscribe",
    201,
  );

  const duplicate = post("/newsletter", {
    body: { email },
    name: "POST /newsletter (duplicate)",
    expect: [400, 401, 409],
  });
  check(duplicate, {
    "newsletter: duplicate subscription is rejected with a 4xx": (r) =>
      r.status >= 400 && r.status < 500,
  });

  expectError(
    post("/newsletter", {
      body: { email: "not-an-email" },
      name: "POST /newsletter (invalid)",
      expect: 400,
    }),
    400,
    "newsletter with invalid email",
    "VALIDATION_ERROR",
  );
  expectError(
    post("/newsletter", {
      body: {},
      name: "POST /newsletter (empty)",
      expect: 400,
    }),
    400,
    "newsletter with empty body",
    "VALIDATION_ERROR",
  );
}

// ---------------------------------------------------------------------------
// payment / webhook guards (never reaches Stripe)
// ---------------------------------------------------------------------------

function paymentGuards(data) {
  expectError(
    post("/payment/create-checkout-session", {
      body: { addressId: FAKE_ID, deliveryMethod: "standard" },
      name: "POST /payment/create-checkout-session (anonymous)",
      expect: 401,
    }),
    401,
    "card checkout without a token",
    "UNAUTHORIZED",
  );

  if (data.userToken) {
    expectError(
      post("/payment/create-checkout-session", {
        token: data.userToken,
        body: { addressId: "bad", deliveryMethod: "teleport" },
        name: "POST /payment/create-checkout-session (invalid)",
        expect: 400,
      }),
      400,
      "card checkout with invalid body",
      "VALIDATION_ERROR",
    );
  }

  expectError(
    post("/payment/create-guest-session", {
      body: { products: [] },
      name: "POST /payment/create-guest-session (invalid)",
      expect: 400,
    }),
    400,
    "guest card checkout with invalid body",
    "VALIDATION_ERROR",
  );

  // Stripe webhook must refuse anything that is not signed by Stripe.
  const hook = request("POST", "/webhook", {
    rawBody: JSON.stringify({ type: "checkout.session.completed" }),
    headers: { "Content-Type": "application/json" },
    name: "POST /webhook (unsigned)",
    expect: 400,
  });
  check(hook, {
    "webhook: unsigned payload is rejected with 400": (r) => r.status === 400,
  });

  const forged = request("POST", "/webhook", {
    rawBody: JSON.stringify({ type: "checkout.session.completed" }),
    headers: {
      "Content-Type": "application/json",
      "Stripe-Signature": "t=1,v1=forged",
    },
    name: "POST /webhook (forged signature)",
    expect: 400,
  });
  check(forged, {
    "webhook: forged signature is rejected with 400": (r) => r.status === 400,
  });
}

// ---------------------------------------------------------------------------
// admin: coupons
// ---------------------------------------------------------------------------

function adminCoupons(data, state) {
  const token = data.adminToken;

  // A: flat 50 off, no minimum
  const flat = couponPayload({ type: "fixed", value: 50 });
  const flatRes = expectOk(
    post("/coupon", { token, body: flat, name: "POST /coupon" }),
    "create fixed coupon",
    201,
  );

  if (!flatRes) return;

  const flatId = flatRes.data._id;
  state.couponIds.push(flatId);

  assert(
    "create fixed coupon: code is stored upper-case",
    flatRes.data.code === flat.code.toUpperCase(),
  );

  // B: 10% capped at 30, needs a 200 basket
  const pct = couponPayload({
    type: "percentage",
    value: 10,
    maxDiscountAmount: 30,
    minOrderValue: 200,
  });
  const pctRes = expectOk(
    post("/coupon", { token, body: pct, name: "POST /coupon" }),
    "create percentage coupon",
    201,
  );

  if (pctRes) state.couponIds.push(pctRes.data._id);

  expectError(
    post("/coupon", {
      token,
      body: flat,
      name: "POST /coupon (duplicate)",
      expect: 409,
    }),
    409,
    "create duplicate coupon code",
  );

  [
    ["percentage above 100", { type: "percentage", value: 150 }],
    ["zero value", { value: 0 }],
    ["code with spaces", { code: "BAD CODE" }],
    ["one-character code", { code: "X" }],
    [
      "per-user limit on a fixed coupon",
      { type: "fixed", value: 10, maxUsesPerUser: 1 },
    ],
    ["unknown type", { type: "bogo" }],
  ].forEach(([label, override]) => {
    expectError(
      post("/coupon", {
        token,
        body: couponPayload(override),
        name: "POST /coupon (invalid)",
        expect: 400,
      }),
      400,
      `create coupon with ${label}`,
      "VALIDATION_ERROR",
    );
  });

  const fetched = expectOk(
    get(`/coupon/${flatId}`, { token, name: "GET /coupon/:id" }),
    "get coupon",
  );
  assert("get coupon: returns the coupon", fetched && fetched.data._id === flatId);

  expectPagination(
    expectOk(
      get("/coupon", {
        token,
        query: { search: flat.code.slice(0, 6), limit: 5 },
        name: "GET /coupon",
      }),
      "list coupons",
    ),
    "list coupons",
  );

  expectError(
    get(`/coupon/${FAKE_ID}`, { token, name: "GET /coupon/:id (unknown)", expect: 404 }),
    404,
    "get unknown coupon",
  );

  // --- apply: public endpoint, so no token is sent
  const applied = expectOk(
    post("/coupon/apply", {
      body: { code: flat.code, subtotal: 500 },
      name: "POST /coupon/apply",
    }),
    "apply fixed coupon",
  );
  assert(
    "apply fixed coupon: discount equals the coupon value",
    applied && applied.data.discount === 50,
  );

  const lowercase = expectOk(
    post("/coupon/apply", {
      body: { code: flat.code.toLowerCase(), subtotal: 500 },
      name: "POST /coupon/apply",
    }),
    "apply coupon with a lower-case code",
  );
  assert(
    "apply coupon: lookup is case-insensitive",
    lowercase && lowercase.data.discount === 50,
  );

  const small = expectOk(
    post("/coupon/apply", {
      body: { code: flat.code, subtotal: 20 },
      name: "POST /coupon/apply",
    }),
    "apply fixed coupon to a tiny basket",
  );
  assert(
    "apply coupon: discount never exceeds the subtotal",
    small && small.data.discount === 20,
  );

  if (pctRes) {
    const capped = expectOk(
      post("/coupon/apply", {
        body: { code: pct.code, subtotal: 1000 },
        name: "POST /coupon/apply",
      }),
      "apply percentage coupon",
    );
    assert(
      "apply percentage coupon: discount is capped by maxDiscountAmount",
      capped && capped.data.discount === 30,
    );

    expectError(
      post("/coupon/apply", {
        body: { code: pct.code, subtotal: 100 },
        name: "POST /coupon/apply (below minimum)",
        expect: 400,
      }),
      400,
      "apply coupon below the minimum order value",
    );
  }

  expectError(
    post("/coupon/apply", {
      body: { code: "NOSUCHCODE", subtotal: 500 },
      name: "POST /coupon/apply (unknown)",
      expect: 400,
    }),
    400,
    "apply unknown coupon",
  );
  expectError(
    post("/coupon/apply", {
      body: { code: flat.code, subtotal: -1 },
      name: "POST /coupon/apply (invalid)",
      expect: 400,
    }),
    400,
    "apply coupon with negative subtotal",
    "VALIDATION_ERROR",
  );

  // --- update then deactivate
  const updated = expectOk(
    patch(`/coupon/${flatId}`, {
      token,
      body: { value: 75 },
      name: "PATCH /coupon/:id",
    }),
    "update coupon value",
  );
  assert("update coupon: value stored", updated && updated.data.value === 75);

  const reapplied = parse(
    post("/coupon/apply", {
      body: { code: flat.code, subtotal: 500 },
      name: "POST /coupon/apply",
    }),
  );
  assert(
    "apply coupon: reflects the updated value",
    reapplied && reapplied.data.discount === 75,
  );

  expectOk(
    patch(`/coupon/${flatId}`, {
      token,
      body: { active: false },
      name: "PATCH /coupon/:id",
    }),
    "deactivate coupon",
  );
  expectError(
    post("/coupon/apply", {
      body: { code: flat.code, subtotal: 500 },
      name: "POST /coupon/apply (inactive)",
      expect: 400,
    }),
    400,
    "apply a deactivated coupon",
  );

  expectError(
    patch(`/coupon/${flatId}`, {
      token,
      body: {},
      name: "PATCH /coupon/:id (empty)",
      expect: 400,
    }),
    400,
    "update coupon with empty body",
    "VALIDATION_ERROR",
  );
  expectError(
    patch(`/coupon/${FAKE_ID}`, {
      token,
      body: { value: 5 },
      name: "PATCH /coupon/:id (unknown)",
      expect: 404,
    }),
    404,
    "update unknown coupon",
  );

  // --- management is admin-only
  if (data.userToken) {
    expectError(
      post("/coupon", {
        token: data.userToken,
        body: couponPayload(),
        name: "POST /coupon (customer)",
        expect: 403,
      }),
      403,
      "customer creating a coupon",
      "FORBIDDEN",
    );
  }
}

// ---------------------------------------------------------------------------
// admin: profile, dashboards, lists
// ---------------------------------------------------------------------------

function adminReads(data) {
  const token = data.adminToken;

  const profile = expectOk(
    get("/admin/profile", { token, name: "GET /admin/profile" }),
    "admin profile",
  );
  assert("admin profile: role is Admin", profile && profile.data.role === "Admin");
  assert("admin profile: password hash is not exposed", profile && profile.data.password === undefined);

  if (profile) {
    const original = profile.data.name;
    const renamed = expectOk(
      patch("/admin/profile", {
        token,
        body: { name: `${original}` },
        name: "PATCH /admin/profile",
      }),
      "update admin profile",
    );
    assert("update admin profile: name echoed back", renamed && renamed.data.name === original);
  }

  expectError(
    patch("/admin/profile", {
      token,
      body: {},
      name: "PATCH /admin/profile (empty)",
      expect: 400,
    }),
    400,
    "update admin profile with empty body",
    "VALIDATION_ERROR",
  );

  const stats = expectOk(
    get("/order/stats", { token, name: "GET /order/stats" }),
    "order stats",
  );
  ["totalOrders", "totalRevenue", "paidOrders", "pendingOrders", "failedOrders"].forEach(
    (key) => {
      assert(
        `order stats: ${key} is numeric`,
        stats && typeof stats.data[key] === "number",
      );
    },
  );

  expectPagination(
    expectOk(
      get("/order", { token, query: { page: 1, limit: 5 }, name: "GET /order" }),
      "admin order list",
    ),
    "admin order list",
    { page: 1, limit: 5 },
  );
  expectOk(
    get("/order", {
      token,
      query: { orderStatus: "processing", paymentStatus: "pending" },
      name: "GET /order (filtered)",
    }),
    "admin order list filtered by status",
  );
  expectError(
    get("/order", {
      token,
      query: { orderStatus: "teleported" },
      name: "GET /order (invalid)",
      expect: 400,
    }),
    400,
    "admin order list with unknown status",
    "VALIDATION_ERROR",
  );

  const users = expectOk(
    get("/user", { token, query: { page: 1, limit: 5 }, name: "GET /user" }),
    "admin user list",
  );
  expectPagination(users, "admin user list", { page: 1, limit: 5 });
  assert(
    "admin user list: password hashes are not exposed",
    users && users.data.every((u) => u.password === undefined),
  );
  expectOk(
    get("/user", { token, query: { role: "Admin" }, name: "GET /user (role)" }),
    "admin user list filtered by role",
  );
  expectError(
    get("/user", {
      token,
      query: { role: "Overlord" },
      name: "GET /user (invalid)",
      expect: 400,
    }),
    400,
    "admin user list with unknown role",
    "VALIDATION_ERROR",
  );
  expectError(
    get(`/user/${FAKE_ID}`, { token, name: "GET /user/:id (unknown)", expect: 404 }),
    404,
    "get unknown user",
  );
  expectError(
    get("/user/not-an-id", { token, name: "GET /user/:id (bad id)", expect: 400 }),
    400,
    "get user with malformed id",
    "VALIDATION_ERROR",
  );

  expectPagination(
    expectOk(
      get("/newsletter", {
        token,
        query: { page: 1, limit: 5 },
        name: "GET /newsletter",
      }),
      "newsletter subscribers",
    ),
    "newsletter subscribers",
    { page: 1, limit: 5 },
  );
}

// ---------------------------------------------------------------------------
// customer: account
// ---------------------------------------------------------------------------

function customerAccount(data) {
  const token = data.userToken;

  const profile = expectOk(
    get("/user/profile", { token, name: "GET /user/profile" }),
    "profile",
  );

  assert("profile: role is User", profile && profile.data.role === "User");
  assert("profile: password hash is not exposed", profile && profile.data.password === undefined);

  if (USER.email) {
    assert(
      "profile: email matches the logged-in account",
      profile && profile.data.email === USER.email.toLowerCase(),
    );
  }

  // --- authentication guards
  expectError(
    get("/user/profile", {
      name: "GET /user/profile (anonymous)",
      expect: 401,
    }),
    401,
    "profile without a token",
    "UNAUTHORIZED",
  );
  expectError(
    get("/user/profile", {
      token: "not.a.jwt",
      name: "GET /user/profile (garbage token)",
      expect: 401,
    }),
    401,
    "profile with a garbage token",
    "UNAUTHORIZED",
  );
  expectError(
    get("/user/profile", {
      headers: { Authorization: "Basic dXNlcjpwYXNz" },
      name: "GET /user/profile (wrong scheme)",
      expect: 401,
    }),
    401,
    "profile with a non-Bearer Authorization header",
    "UNAUTHORIZED",
  );

  // --- refresh token endpoint
  const noCookie = get("/user/refresh", {
    name: "GET /user/refresh (no cookie)",
    expect: 401,
  });
  check(noCookie, {
    "refresh without a cookie -> 401": (r) => r.status === 401,
  });

  const badCookie = get("/user/refresh", {
    headers: { Cookie: "refreshToken=not.a.valid.token" },
    name: "GET /user/refresh (bad cookie)",
    expect: [401, 403],
  });
  check(badCookie, {
    "refresh with a forged cookie is refused (401/403)": (r) =>
      r.status === 401 || r.status === 403,
  });

  // --- update profile, then restore it
  if (profile) {
    const originalName = profile.data.name;
    const tempName = `K6 Temp ${uid()}`;

    const updated = expectOk(
      patch("/user", { token, body: { name: tempName }, name: "PATCH /user" }),
      "update profile",
    );
    assert("update profile: new name stored", updated && updated.data.name === tempName);

    if (originalName) {
      patch("/user", {
        token,
        body: { name: originalName },
        name: "PATCH /user (restore)",
      });
    }
  }

  expectError(
    patch("/user", { token, body: {}, name: "PATCH /user (empty)", expect: 400 }),
    400,
    "update profile with empty body",
    "VALIDATION_ERROR",
  );

  // --- password change validation (never actually changes the password)
  expectError(
    put("/user/password", {
      token,
      body: { currentPassword: "short", newPassword: "alsoshort" },
      name: "PUT /user/password (invalid)",
      expect: 400,
    }),
    400,
    "change password with too-short values",
    "VALIDATION_ERROR",
  );

  // --- admin-only user management is closed to customers
  expectError(
    get("/user", { token, name: "GET /user (customer)", expect: 403 }),
    403,
    "customer listing all users",
    "FORBIDDEN",
  );
  expectError(
    get("/order/stats", { token, name: "GET /order/stats (customer)", expect: 403 }),
    403,
    "customer reading order stats",
    "FORBIDDEN",
  );

  // --- my orders
  expectPagination(
    expectOk(
      get("/order/my-orders", {
        token,
        query: { page: 1, limit: 5 },
        name: "GET /order/my-orders",
      }),
      "my orders",
    ),
    "my orders",
    { page: 1, limit: 5 },
  );
  expectError(
    get("/order/my-orders", {
      name: "GET /order/my-orders (anonymous)",
      expect: 401,
    }),
    401,
    "my orders without a token",
    "UNAUTHORIZED",
  );
}

// ---------------------------------------------------------------------------
// customer: addresses
// ---------------------------------------------------------------------------

function customerAddresses(data, state) {
  const token = data.userToken;

  const payload = savedAddressPayload({ label: "Work" });
  const created = expectOk(
    post("/address", { token, body: payload, name: "POST /address" }),
    "create address",
    201,
  );

  if (!created) return;

  const id = created.data._id;
  state.addressIds.push(id);

  assert("create address: city stored", created.data.city === payload.city);
  assert("create address: label stored", created.data.label === "Work");

  [
    ["letters in zip code", { zipCode: "ABCDEF" }],
    ["unknown label", { label: "Castle" }],
    ["digits in name", { name: "Agent 47" }],
    ["letters in phone", { phone: "call me" }],
    ["missing city", { city: "" }],
  ].forEach(([label, override]) => {
    expectError(
      post("/address", {
        token,
        body: savedAddressPayload(override),
        name: "POST /address (invalid)",
        expect: 400,
      }),
      400,
      `create address with ${label}`,
      "VALIDATION_ERROR",
    );
  });

  const list = expectOk(
    get("/address", { token, name: "GET /address" }),
    "list addresses",
  );
  assert(
    "list addresses: includes the created address",
    list && Array.isArray(list.data) && list.data.some((a) => a._id === id),
  );

  const updated = expectOk(
    patch(`/address/${id}`, {
      token,
      body: { city: "Pune" },
      name: "PATCH /address/:id",
    }),
    "update address",
  );
  assert("update address: city changed", updated && updated.data.city === "Pune");

  expectError(
    patch(`/address/${id}`, {
      token,
      body: {},
      name: "PATCH /address/:id (empty)",
      expect: 400,
    }),
    400,
    "update address with empty body",
    "VALIDATION_ERROR",
  );
  expectError(
    patch(`/address/${FAKE_ID}`, {
      token,
      body: { city: "Nowhere" },
      name: "PATCH /address/:id (unknown)",
      expect: 404,
    }),
    404,
    "update unknown address",
  );
  expectError(
    get("/address", { name: "GET /address (anonymous)", expect: 401 }),
    401,
    "list addresses without a token",
    "UNAUTHORIZED",
  );

  expectOk(
    del(`/address/${id}`, { token, name: "DELETE /address/:id" }),
    "delete address",
  );
  state.addressIds = state.addressIds.filter((a) => a !== id);

  expectError(
    del(`/address/${id}`, {
      token,
      name: "DELETE /address/:id (again)",
      expect: 404,
    }),
    404,
    "delete the same address twice",
  );
}

// ---------------------------------------------------------------------------
// customer: wishlist
// ---------------------------------------------------------------------------

function customerWishlist(data, state) {
  const token = data.userToken;

  if (!state.product) return;

  const first = expectOk(
    post("/wishlist/toggle", {
      token,
      body: { productId: state.product.id },
      name: "POST /wishlist/toggle",
    }),
    "wishlist toggle",
  );
  const second = expectOk(
    post("/wishlist/toggle", {
      token,
      body: { productId: state.product.id },
      name: "POST /wishlist/toggle",
    }),
    "wishlist toggle again",
  );

  assert(
    "wishlist: toggling twice adds then removes (or removes then adds)",
    first &&
      second &&
      ["added", "removed"].indexOf(first.data.action) !== -1 &&
      first.data.action !== second.data.action,
  );

  expectOk(get("/wishlist", { token, name: "GET /wishlist" }), "wishlist");
  expectOk(
    get("/wishlist/details", { token, name: "GET /wishlist/details" }),
    "wishlist details",
  );

  expectError(
    post("/wishlist/toggle", {
      token,
      body: { productId: "nope" },
      name: "POST /wishlist/toggle (invalid)",
      expect: 400,
    }),
    400,
    "wishlist toggle with malformed id",
    "VALIDATION_ERROR",
  );
  expectError(
    post("/wishlist/toggle", {
      body: { productId: state.product.id },
      name: "POST /wishlist/toggle (anonymous)",
      expect: 401,
    }),
    401,
    "wishlist toggle without a token",
    "UNAUTHORIZED",
  );
}

// ---------------------------------------------------------------------------
// customer: cart
// ---------------------------------------------------------------------------

function customerCart(data, state) {
  const token = data.userToken;

  if (!state.product || !(state.product.stock > 2)) {
    console.warn("No in-stock product available: cart checks are skipped.");
    return;
  }

  // Start from an empty cart so counts are deterministic.
  expectOk(del("/cart/clear", { token, name: "DELETE /cart/clear" }), "clear cart");

  const empty = expectOk(get("/cart", { token, name: "GET /cart" }), "empty cart");
  assert(
    "empty cart: no products and zero totals",
    empty &&
      Array.isArray(empty.data.products) &&
      empty.data.products.length === 0 &&
      empty.data.total === 0,
  );

  const added = expectOk(
    post("/cart", {
      token,
      body: { productId: state.product.id, quantity: 2 },
      name: "POST /cart",
    }),
    "add to cart",
  );

  assert(
    "add to cart: line item created with the requested quantity",
    added &&
      added.data.products.length === 1 &&
      added.data.products[0].quantity === 2,
  );

  const lineId = added ? added.data.products[0]._id : null;

  const count = expectOk(
    get("/cart/count", { token, name: "GET /cart/count" }),
    "cart count",
  );
  assert("cart count: one line item", count && count.data.count === 1);

  // adding the same product again merges into the existing line
  const merged = expectOk(
    post("/cart", {
      token,
      body: { productId: state.product.id },
      name: "POST /cart",
    }),
    "add the same product again",
  );
  assert(
    "add to cart: same product merges into one line (quantity 3)",
    merged &&
      merged.data.products.length === 1 &&
      merged.data.products[0].quantity === 3,
  );

  const cart = expectOk(get("/cart", { token, name: "GET /cart" }), "cart");
  assert(
    "cart: total equals subtotal minus discount",
    cart &&
      Math.abs(cart.data.total - (cart.data.subtotal - cart.data.discountTotal)) < 0.001,
  );

  if (lineId) {
    const updated = expectOk(
      put("/cart", {
        token,
        body: { cartItemId: lineId, quantity: 4 },
        name: "PUT /cart",
      }),
      "update cart quantity",
    );
    assert(
      "update cart quantity: new quantity stored",
      updated && updated.data.products[0].quantity === 4,
    );

    expectError(
      put("/cart", {
        token,
        body: { cartItemId: lineId, quantity: 11 },
        name: "PUT /cart (too many)",
        expect: 400,
      }),
      400,
      "update cart quantity above the per-line cap of 10",
      "VALIDATION_ERROR",
    );
    expectError(
      put("/cart", {
        token,
        body: { cartItemId: lineId, quantity: 0 },
        name: "PUT /cart (zero)",
        expect: 400,
      }),
      400,
      "update cart quantity to 0",
      "VALIDATION_ERROR",
    );
  }

  expectError(
    put("/cart", {
      token,
      body: { cartItemId: FAKE_ID, quantity: 1 },
      name: "PUT /cart (unknown line)",
      expect: 404,
    }),
    404,
    "update a cart line that does not exist",
  );

  [
    ["quantity 0", { productId: state.product.id, quantity: 0 }],
    ["quantity 11", { productId: state.product.id, quantity: 11 }],
    ["fractional quantity", { productId: state.product.id, quantity: 1.5 }],
    ["malformed product id", { productId: "nope" }],
    ["missing product id", {}],
  ].forEach(([label, body]) => {
    expectError(
      post("/cart", {
        token,
        body,
        name: "POST /cart (invalid)",
        expect: 400,
      }),
      400,
      `add to cart with ${label}`,
      "VALIDATION_ERROR",
    );
  });

  expectError(
    post("/cart", {
      token,
      body: { productId: FAKE_ID },
      name: "POST /cart (unknown product)",
      expect: 404,
    }),
    404,
    "add an unknown product to the cart",
  );
  expectError(
    post("/cart", {
      token,
      body: {
        productId: state.product.id,
        variantId: FAKE_ID,
        size: "XXL",
      },
      name: "POST /cart (unknown variant)",
      expect: 400,
    }),
    400,
    "add an unknown variant/size to the cart",
  );
  expectError(
    get("/cart", { name: "GET /cart (anonymous)", expect: 401 }),
    401,
    "cart without a token",
    "UNAUTHORIZED",
  );

  if (lineId) {
    expectOk(
      del(`/cart/${lineId}`, { token, name: "DELETE /cart/:cartItemId" }),
      "remove from cart",
    );
    const after = parse(get("/cart/count", { token, name: "GET /cart/count" }));
    assert("remove from cart: cart is empty again", after && after.data.count === 0);
  }

  expectError(
    del("/cart/not-an-id", {
      token,
      name: "DELETE /cart/:cartItemId (bad id)",
      expect: 400,
    }),
    400,
    "remove a cart line with malformed id",
    "VALIDATION_ERROR",
  );

  expectOk(del("/cart/clear", { token, name: "DELETE /cart/clear" }), "clear cart again");
}

// ---------------------------------------------------------------------------
// auth: negative cases (each spends one auth-limiter attempt)
// ---------------------------------------------------------------------------

function authNegatives(data) {
  expectError(
    post("/user/login", {
      body: { email: "k6.nobody@example.test", password: "definitely-wrong" },
      name: "POST /user/login (wrong credentials)",
      expect: 401,
    }),
    401,
    "login with unknown credentials",
  );

  const invalid = expectError(
    post("/user/signup", {
      body: { email: "not-an-email", password: "short" },
      name: "POST /user/signup (invalid)",
      expect: 400,
    }),
    400,
    "signup with invalid email and short password",
    "VALIDATION_ERROR",
  );
  assert(
    "signup validation: reports both fields",
    invalid &&
      invalid.data.details.some((d) => d.field === "email") &&
      invalid.data.details.some((d) => d.field === "password"),
  );

  // The customer endpoint answers identically whether or not the account
  // exists. The admin one should too; if it says 404 it leaks which admin
  // addresses are real.
  const adminForgot = post("/admin/forgot-password", {
    body: { email: `k6.nobody.${uid()}@example.test` },
    name: "POST /admin/forgot-password (unknown)",
    expect: [200, 404],
  });
  finding(
    "POST /admin/forgot-password answers 404 for an unknown email, revealing which admin emails exist " +
      "(POST /user/forgot-password avoids this with a generic reply)",
    adminForgot.status === 404,
  );
}

// ---------------------------------------------------------------------------
// checkout: COD lifecycle  (ENABLE_ORDERS=true)
// ---------------------------------------------------------------------------

function orderLifecycle(data, state) {
  const user = data.userToken;
  const admin = data.adminToken;
  const product = state.product;

  const addr = expectOk(
    post("/address", {
      token: user,
      body: savedAddressPayload({ label: "Home" }),
      name: "POST /address",
    }),
    "create address for checkout",
    201,
  );

  if (!addr) return;

  state.addressIds.push(addr.data._id);
  const addressId = addr.data._id;

  // --- empty cart cannot be checked out
  del("/cart/clear", { token: user, name: "DELETE /cart/clear" });
  expectError(
    post("/order/cod", {
      token: user,
      body: { addressId, deliveryMethod: "standard" },
      name: "POST /order/cod (empty cart)",
      expect: 400,
    }),
    400,
    "COD checkout with an empty cart",
  );

  // --- validation
  expectError(
    post("/order/cod", {
      token: user,
      body: { addressId, deliveryMethod: "teleport" },
      name: "POST /order/cod (invalid)",
      expect: 400,
    }),
    400,
    "COD checkout with unknown delivery method",
    "VALIDATION_ERROR",
  );
  expectError(
    post("/order/cod", {
      token: user,
      body: { addressId: "nope", deliveryMethod: "standard" },
      name: "POST /order/cod (invalid)",
      expect: 400,
    }),
    400,
    "COD checkout with malformed address id",
    "VALIDATION_ERROR",
  );
  expectError(
    post("/order/cod", {
      body: { addressId, deliveryMethod: "standard" },
      name: "POST /order/cod (anonymous)",
      expect: 401,
    }),
    401,
    "COD checkout without a token",
    "UNAUTHORIZED",
  );

  // --- happy path
  const stockBefore = parse(
    get(`/product/${product.slug}/${product.id}`, { name: "GET /product/:slug/:id" }),
  ).data.stock;

  expectOk(
    post("/cart", {
      token: user,
      body: { productId: product.id, quantity: 2 },
      name: "POST /cart",
    }),
    "add to cart before checkout",
  );

  const placed = expectOk(
    post("/order/cod", {
      token: user,
      body: { addressId, deliveryMethod: "express" },
      name: "POST /order/cod",
    }),
    "place COD order",
    201,
  );

  if (!placed) return;

  const orderId = placed.data.orderId;
  state.orderIds.push(orderId);

  assert("place COD order: orderId returned", Boolean(orderId));
  assert(
    "place COD order: redirectUrl points at the success page",
    typeof placed.data.redirectUrl === "string" &&
      placed.data.redirectUrl.indexOf(orderId) !== -1,
  );

  const cartAfter = parse(
    get("/cart/count", { token: user, name: "GET /cart/count" }),
  );
  assert("place COD order: cart is emptied", cartAfter && cartAfter.data.count === 0);

  const stockAfter = parse(
    get(`/product/${product.slug}/${product.id}`, { name: "GET /product/:slug/:id" }),
  ).data.stock;
  assert(
    "place COD order: stock is reduced by the quantity ordered",
    stockAfter === stockBefore - 2,
  );

  // --- the order as the customer sees it
  const mine = expectOk(
    get(`/order/${orderId}`, { token: user, name: "GET /order/:id" }),
    "get own order",
  );

  if (mine) {
    const o = mine.data;
    assert("order: payment type is cod", o.paymentType === "cod");
    assert("order: starts as processing / pending", o.orderStatus === "processing" && o.paymentStatus === "pending");
    assert("order: express delivery charge applied", o.deliveryCharge === 120);
    assert(
      "order: total = subtotal - discount + delivery",
      Math.abs(o.totalAmount - (o.subtotal - (o.discount || 0) + o.deliveryCharge)) < 0.001,
    );
    assert(
      "order: one line with quantity 2",
      Array.isArray(o.products) && o.products.length === 1 && o.products[0].quantity === 2,
    );
  }

  expectPagination(
    expectOk(
      get("/order/my-orders", {
        token: user,
        query: { page: 1, limit: 5 },
        name: "GET /order/my-orders",
      }),
      "my orders after checkout",
    ),
    "my orders after checkout",
  );

  // --- invoice
  const invoice = expectOk(
    get(`/invoice/${orderId}`, { token: user, name: "GET /invoice/:orderId" }),
    "get invoice",
  );
  assert(
    "invoice: has a number and matches the order total",
    invoice &&
      typeof invoice.data.invoiceNumber === "string" &&
      mine &&
      invoice.data.totalAmount === mine.data.totalAmount,
  );

  const pdf = get(`/invoice/${orderId}/download`, {
    token: user,
    name: "GET /invoice/:orderId/download",
  });
  check(pdf, {
    "invoice download -> 200": (r) => r.status === 200,
    "invoice download is a PDF": (r) =>
      (header(r, "Content-Type") || "").indexOf("application/pdf") !== -1 &&
      String(r.body).slice(0, 4) === "%PDF",
    "invoice download is an attachment": (r) =>
      (header(r, "Content-Disposition") || "").indexOf("attachment") !== -1,
  });

  expectError(
    get(`/invoice/${orderId}`, { name: "GET /invoice/:orderId (anonymous)", expect: 401 }),
    401,
    "invoice without a token",
    "UNAUTHORIZED",
  );
  expectError(
    get("/invoice/not-an-id", {
      token: user,
      name: "GET /invoice/:orderId (bad id)",
      expect: 400,
    }),
    400,
    "invoice with malformed id",
    "VALIDATION_ERROR",
  );

  // --- order access control
  expectError(
    get("/order/not-an-id", {
      token: user,
      name: "GET /order/:id (bad id)",
      expect: 400,
    }),
    400,
    "get order with malformed id",
    "VALIDATION_ERROR",
  );
  expectError(
    get(`/order/${FAKE_ID}`, {
      token: user,
      name: "GET /order/:id (unknown)",
      expect: 404,
    }),
    404,
    "get unknown order",
  );
  expectError(
    get(`/order/${orderId}`, {
      name: "GET /order/:id (anonymous)",
      expect: 401,
    }),
    401,
    "get order without a token",
    "UNAUTHORIZED",
  );
  expectError(
    patch(`/order/${orderId}`, {
      token: user,
      body: { orderStatus: "delivered" },
      name: "PATCH /order/:id (customer)",
      expect: 403,
    }),
    403,
    "customer changing an order's status",
    "FORBIDDEN",
  );
  expectError(
    del(`/order/${orderId}`, {
      token: user,
      name: "DELETE /order/:id (customer)",
      expect: 403,
    }),
    403,
    "customer deleting an order",
    "FORBIDDEN",
  );

  // --- admin fulfilment
  const adminView = expectOk(
    get(`/order/${orderId}`, { token: admin, name: "GET /order/:id (admin)" }),
    "admin reads the order",
  );
  assert("admin order view: returns the same order", adminView && adminView.data._id === orderId);

  const shipped = expectOk(
    patch(`/order/${orderId}`, {
      token: admin,
      body: { orderStatus: "shipped" },
      name: "PATCH /order/:id",
    }),
    "admin ships the order",
  );
  assert("admin ships: status stored", shipped && shipped.data.orderStatus === "shipped");

  expectError(
    patch(`/order/${orderId}`, {
      token: admin,
      body: { orderStatus: "cancelled" },
      name: "PATCH /order/:id (invalid)",
      expect: 400,
    }),
    400,
    "admin sets an unknown order status",
    "VALIDATION_ERROR",
  );
  expectError(
    patch(`/order/${orderId}`, {
      token: admin,
      body: {},
      name: "PATCH /order/:id (empty)",
      expect: 400,
    }),
    400,
    "admin updates an order with an empty body",
    "VALIDATION_ERROR",
  );
  expectError(
    patch(`/order/${FAKE_ID}`, {
      token: admin,
      body: { orderStatus: "shipped" },
      name: "PATCH /order/:id (unknown)",
      expect: 404,
    }),
    404,
    "admin updates an unknown order",
  );
}

// ---------------------------------------------------------------------------
// checkout: coupon applied at checkout
// ---------------------------------------------------------------------------

function couponAtCheckout(data, state) {
  const user = data.userToken;
  const admin = data.adminToken;
  const product = state.product;

  if (state.addressIds.length === 0) return;

  const coupon = couponPayload({ type: "fixed", value: 50 });
  const made = expectOk(
    post("/coupon", { token: admin, body: coupon, name: "POST /coupon" }),
    "create coupon for checkout",
    201,
  );

  if (!made) return;

  state.couponIds.push(made.data._id);

  del("/cart/clear", { token: user, name: "DELETE /cart/clear" });
  expectOk(
    post("/cart", {
      token: user,
      body: { productId: product.id, quantity: 1 },
      name: "POST /cart",
    }),
    "add to cart for coupon checkout",
  );

  const placed = expectOk(
    post("/order/cod", {
      token: user,
      body: {
        addressId: state.addressIds[state.addressIds.length - 1],
        deliveryMethod: "standard",
        couponCode: coupon.code,
      },
      name: "POST /order/cod (coupon)",
    }),
    "place COD order with a coupon",
    201,
  );

  if (!placed) return;

  state.orderIds.push(placed.data.orderId);

  const order = parse(
    get(`/order/${placed.data.orderId}`, { token: user, name: "GET /order/:id" }),
  );

  // The storefront sends couponCode with the checkout request. The order
  // endpoints' Zod schemas must therefore accept it, or the discount is
  // silently dropped and the customer is charged full price.
  assert(
    "coupon at checkout: couponCode sent with the request is applied to the order",
    order && order.data.discount === 50,
  );
  assert(
    "coupon at checkout: order records which coupon was used",
    order && order.data.coupon && order.data.coupon.code === coupon.code.toUpperCase(),
  );

  const useCount = parse(
    get(`/coupon/${made.data._id}`, { token: admin, name: "GET /coupon/:id" }),
  );
  assert(
    "coupon at checkout: usedCount incremented",
    useCount && useCount.data.usedCount === 1,
  );
}

// ---------------------------------------------------------------------------
// checkout: guest order
// ---------------------------------------------------------------------------

function guestOrder(data, state) {
  const admin = data.adminToken;
  const product = state.product;

  const line = { productId: product.id, quantity: 1 };

  const placed = expectOk(
    post("/order/guest", {
      body: guestOrderPayload([line]),
      name: "POST /order/guest",
    }),
    "place guest COD order",
    201,
  );

  if (placed) {
    state.orderIds.push(placed.data.orderId);

    const receipt = expectOk(
      get(`/order/order-id/${placed.data.orderId}`, {
        name: "GET /order/order-id/:id",
      }),
      "guest receipt by order id",
    );
    assert(
      "guest receipt: is the order just placed",
      receipt && receipt.data._id === placed.data.orderId,
    );

    // Not asserted as pass/fail: the receipt page needs this to work without a
    // login, but it also means an order id alone exposes the buyer's details.
    finding(
      "GET /order/order-id/:id returns a full order (buyer name, phone, address) to an anonymous caller who knows the id",
      receipt &&
        receipt.data &&
        Boolean(receipt.data.address || receipt.data.email || receipt.data.phone),
    );
  }

  [
    ["no products", { products: [] }],
    ["quantity 11", { products: [{ productId: product.id, quantity: 11 }] }],
    ["quantity 0", { products: [{ productId: product.id, quantity: 0 }] }],
    ["invalid email", { email: "nope" }],
    ["unknown delivery method", { deliveryMethod: "carrier-pigeon" }],
    ["digits in name", { name: "R2D2" }],
    ["address without a city", { address: shippingAddress({ city: "" }) }],
  ].forEach(([label, override]) => {
    expectError(
      post("/order/guest", {
        body: guestOrderPayload([line], override),
        name: "POST /order/guest (invalid)",
        expect: 400,
      }),
      400,
      `guest order with ${label}`,
      "VALIDATION_ERROR",
    );
  });

  expectError(
    post("/order/guest", {
      body: guestOrderPayload([{ productId: FAKE_ID, quantity: 1 }]),
      name: "POST /order/guest (unknown product)",
      expect: [400, 404],
    }),
    400,
    "guest order for a product that does not exist",
  );

  // --- stock enforcement: ask for more than exists
  const scarce = post("/product", {
    token: admin,
    body: productPayload(state.categoryId, { stock: 1, variants: [] }),
    name: "POST /product",
    expect: [201],
  });
  const scarceBody = parse(scarce);

  if (scarce.status === 201 && scarceBody) {
    state.lowStockId = scarceBody.data._id;

    const over = expectError(
      post("/order/guest", {
        body: guestOrderPayload([{ productId: state.lowStockId, quantity: 2 }]),
        name: "POST /order/guest (insufficient stock)",
        expect: 400,
      }),
      400,
      "guest order for more units than are in stock",
    );
    assert(
      "insufficient stock: message says how many are available",
      over && /only 1/i.test(over.message),
    );
  }

  expectOk(
    get("/order", {
      token: admin,
      query: { search: "K Six Tester", limit: 5 },
      name: "GET /order (search)",
    }),
    "admin finds the guest order by name",
  );
}

// ---------------------------------------------------------------------------
// reviews  (needs a paid order, so it runs after checkout)
// ---------------------------------------------------------------------------

function reviews(data, state) {
  const user = data.userToken;
  const admin = data.adminToken;
  const product = state.product;

  const orderId = state.orderIds[0];

  if (!orderId) return;

  // Before the order is paid the customer may not review the product.
  const before = expectOk(
    get(`/review/mine/${product.id}`, { token: user, name: "GET /review/mine/:productId" }),
    "my review status before payment",
  );
  assert("review: not allowed before payment", before && before.data.canReview === false);

  expectError(
    post("/review", {
      token: user,
      body: { productId: product.id, rating: 5, comment: "Too early" },
      name: "POST /review (unpaid)",
      expect: 403,
    }),
    403,
    "review a product from an unpaid order",
  );

  expectOk(
    patch(`/order/${orderId}`, {
      token: admin,
      body: { paymentStatus: "paid" },
      name: "PATCH /order/:id",
    }),
    "admin marks the order paid",
  );

  const after = expectOk(
    get(`/review/mine/${product.id}`, { token: user, name: "GET /review/mine/:productId" }),
    "my review status after payment",
  );
  assert("review: allowed once the order is paid", after && after.data.canReview === true);

  const created = expectOk(
    post("/review", {
      token: user,
      body: { productId: product.id, rating: 5, comment: "Great, from k6" },
      name: "POST /review",
    }),
    "create review",
    201,
  );

  if (!created) return;

  state.reviewId = created.data.id;

  assert("create review: rating stored", created.data.rating === 5);
  assert(
    "create review: public view shows a first name only, no email",
    typeof created.data.firstName === "string" && created.data.email === undefined,
  );

  [
    ["rating 0", { rating: 0 }],
    ["rating 6", { rating: 6 }],
    ["fractional rating", { rating: 3.5 }],
    ["malformed product id", { productId: "nope" }],
  ].forEach(([label, override]) => {
    expectError(
      post("/review", {
        token: user,
        body: Object.assign({ productId: product.id, rating: 4 }, override),
        name: "POST /review (invalid)",
        expect: 400,
      }),
      400,
      `create review with ${label}`,
      "VALIDATION_ERROR",
    );
  });
  expectError(
    post("/review", {
      body: { productId: product.id, rating: 4 },
      name: "POST /review (anonymous)",
      expect: 401,
    }),
    401,
    "create review without a token",
    "UNAUTHORIZED",
  );

  const mine = expectOk(
    get(`/review/mine/${product.id}`, { token: user, name: "GET /review/mine/:productId" }),
    "my review",
  );
  assert(
    "my review: returns the review just created",
    mine && mine.data.review && mine.data.review.id === state.reviewId,
  );

  const list = expectOk(
    get(`/review/${product.id}`, { name: "GET /review/:productId" }),
    "public review list",
  );
  assert(
    "review list: includes the new review",
    list && list.data.some((r) => r.id === state.reviewId),
  );

  const updated = expectOk(
    patch(`/review/${state.reviewId}`, {
      token: user,
      body: { rating: 4 },
      name: "PATCH /review/:id",
    }),
    "update review",
  );
  assert("update review: rating changed", updated && updated.data.rating === 4);

  const rated = parse(
    get(`/product/${product.slug}/${product.id}`, { name: "GET /product/:slug/:id" }),
  );
  assert(
    "product rating and review count follow the review",
    rated && rated.data.rating === 4 && rated.data.reviewsCount === 1,
  );

  expectError(
    patch(`/review/${state.reviewId}`, {
      token: user,
      body: {},
      name: "PATCH /review/:id (empty)",
      expect: 400,
    }),
    400,
    "update review with empty body",
    "VALIDATION_ERROR",
  );
  expectError(
    patch(`/review/${FAKE_ID}`, {
      token: user,
      body: { rating: 3 },
      name: "PATCH /review/:id (unknown)",
      expect: 404,
    }),
    404,
    "update unknown review",
  );

  expectOk(
    del(`/review/${state.reviewId}`, { token: user, name: "DELETE /review/:id" }),
    "delete review",
  );

  const cleared = parse(
    get(`/product/${product.slug}/${product.id}`, { name: "GET /product/:slug/:id" }),
  );
  assert(
    "deleting the review resets the product rating",
    cleared && cleared.data.reviewsCount === 0,
  );

  expectError(
    del(`/review/${state.reviewId}`, {
      token: user,
      name: "DELETE /review/:id (again)",
      expect: 404,
    }),
    404,
    "delete the same review twice",
  );

  state.reviewId = null;
}

// ---------------------------------------------------------------------------
// cleanup: always runs
// ---------------------------------------------------------------------------

function cleanup(data, state) {
  const gone = [200, 404];

  if (data.userToken && state.reviewId) {
    del(`/review/${state.reviewId}`, {
      token: data.userToken,
      name: "DELETE /review/:id",
      expect: gone,
    });
  }

  if (data.adminToken) {
    state.orderIds.forEach((id) =>
      del(`/order/${id}`, {
        token: data.adminToken,
        name: "DELETE /order/:id",
        expect: gone,
      }),
    );

    state.couponIds.forEach((id) =>
      del(`/coupon/${id}`, {
        token: data.adminToken,
        name: "DELETE /coupon/:id",
        expect: gone,
      }),
    );
  }

  if (data.userToken) {
    state.addressIds.forEach((id) =>
      del(`/address/${id}`, {
        token: data.userToken,
        name: "DELETE /address/:id",
        expect: gone,
      }),
    );

    del("/cart/clear", { token: data.userToken, name: "DELETE /cart/clear" });
  }

  if (data.adminToken) {
    [state.lowStockId, state.ownsProduct ? state.product.id : null]
      .filter(Boolean)
      .forEach((id) =>
        del(`/product/${id}`, {
          token: data.adminToken,
          name: "DELETE /product/:id",
          expect: gone,
        }),
      );

    if (state.categoryId) {
      del(`/category/${state.categoryId}`, {
        token: data.adminToken,
        name: "DELETE /category/:id",
        expect: gone,
      });
    }
  }
}
