// SMOKE: one VU, ~30s. Proves the server is up and every main read path works.
// Run this first, and after every deploy. It is cheap and spends only the two
// auth-limiter attempts used by setup() (zero when tokens are supplied).
//
//   k6 run -e BASE_URL=http://localhost:8080 \
//          -e USER_EMAIL=... -e USER_PASSWORD=... \
//          -e ADMIN_EMAIL=... -e ADMIN_PASSWORD=... tests/smoke.test.js

import { sleep } from "k6";

import { assertServerReachable } from "../lib/preflight.js";
import { authenticate } from "../lib/auth.js";
import { get } from "../lib/client.js";
import { assert, expectOk, expectPagination } from "../lib/checks.js";
import { prepareCatalog, removeSeed } from "../lib/catalog.js";
import { pick } from "../lib/data.js";

export const options = {
  vus: 1,
  duration: "30s",
  thresholds: {
    checks: ["rate==1"],
    http_req_failed: ["rate<0.01"],
    http_req_duration: ["p(95)<1000"],
    server_error_responses: ["count==0"],
    rate_limited_responses: ["count==0"],
  },
};

export function setup() {
  assertServerReachable();

  const auth = authenticate({ user: true, admin: true });
  const { catalog, seeded } = prepareCatalog(auth.admin && auth.admin.token);

  return {
    userToken: auth.user && auth.user.token,
    adminToken: auth.admin && auth.admin.token,
    catalog,
    seeded,
  };
}

export default function (data) {
  // --- Public ---------------------------------------------------------------
  const health = expectOk(get("/health", { name: "GET /health" }), "health");
  assert("health reports status ok", health && health.data.status === "ok");

  expectPagination(
    expectOk(
      get("/category", { query: { limit: 10 }, name: "GET /category" }),
      "categories",
    ),
    "categories",
  );

  expectPagination(
    expectOk(
      get("/product", {
        query: { publish: "true", limit: 10 },
        name: "GET /product",
      }),
      "products",
    ),
    "products",
    { page: 1, limit: 10 },
  );

  expectOk(
    get("/product/featured", { name: "GET /product/featured" }),
    "featured",
  );
  expectOk(
    get("/product/best-sellers", { name: "GET /product/best-sellers" }),
    "best-sellers",
  );
  expectPagination(
    expectOk(
      get("/product/filter", {
        query: { sort: "newest", limit: 10 },
        name: "GET /product/filter",
      }),
      "filter",
    ),
    "filter",
  );
  expectOk(
    get("/product/search", {
      query: { name: "a", limit: 5 },
      name: "GET /product/search",
    }),
    "search",
  );

  if (data.catalog.products.length > 0) {
    const product = pick(data.catalog.products);

    const detail = expectOk(
      get(`/product/${product.slug}/${product.id}`, {
        name: "GET /product/:slug/:id",
      }),
      "product detail",
    );
    assert(
      "product detail returns the requested product",
      detail && detail.data._id === product.id,
    );

    expectOk(
      get(`/product/similar/${product.id}`, {
        name: "GET /product/similar/:id",
      }),
      "similar products",
    );
    expectPagination(
      expectOk(
        get(`/review/${product.id}`, { name: "GET /review/:productId" }),
        "reviews",
      ),
      "reviews",
    );
  }

  // --- Customer -------------------------------------------------------------
  if (data.userToken) {
    const token = data.userToken;

    const profile = expectOk(
      get("/user/profile", { token, name: "GET /user/profile" }),
      "profile",
    );
    assert("profile has an email", profile && Boolean(profile.data.email));

    expectOk(get("/cart", { token, name: "GET /cart" }), "cart");
    expectOk(
      get("/cart/count", { token, name: "GET /cart/count" }),
      "cart count",
    );
    expectOk(get("/wishlist", { token, name: "GET /wishlist" }), "wishlist");
    expectOk(get("/address", { token, name: "GET /address" }), "addresses");
    expectPagination(
      expectOk(
        get("/order/my-orders", { token, name: "GET /order/my-orders" }),
        "my orders",
      ),
      "my orders",
    );
  }

  // --- Admin ----------------------------------------------------------------
  if (data.adminToken) {
    const token = data.adminToken;

    const profile = expectOk(
      get("/admin/profile", { token, name: "GET /admin/profile" }),
      "admin profile",
    );
    assert("admin profile has role Admin", profile && profile.data.role === "Admin");

    const stats = expectOk(
      get("/order/stats", { token, name: "GET /order/stats" }),
      "order stats",
    );
    assert(
      "order stats expose numeric totals",
      stats &&
        typeof stats.data.totalOrders === "number" &&
        typeof stats.data.totalRevenue === "number",
    );

    expectPagination(
      expectOk(get("/order", { token, name: "GET /order" }), "admin orders"),
      "admin orders",
    );
    expectPagination(
      expectOk(get("/user", { token, name: "GET /user" }), "admin users"),
      "admin users",
    );
    expectPagination(
      expectOk(get("/coupon", { token, name: "GET /coupon" }), "admin coupons"),
      "admin coupons",
    );
  }

  sleep(1);
}

export function teardown(data) {
  removeSeed(data.adminToken, data.seeded);
}
