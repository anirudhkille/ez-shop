// SECURITY: authorisation boundaries and cross-customer isolation.
//
// functional.test.js checks that each endpoint behaves correctly for the
// *owner*. This file checks the negative space: that one customer cannot read
// or change another customer's data, that a customer token cannot reach admin
// routes, and that the auth limiter actually engages.
//
// This is the test that finds IDOR. Most of it needs no fixtures at all, so it
// runs without touching the catalogue or placing orders.
//
//   k6 run -e BASE_URL=http://localhost:7777 \
//          -e USER_EMAIL=... -e USER_PASSWORD=... \
//          -e USER2_EMAIL=... -e USER2_PASSWORD=... \
//          tests/security.test.js
//
// USER2 is a second, unrelated customer. Without it the cross-customer groups
// are skipped and the file degrades to the unauthenticated / role-escalation
// checks, which still need only one customer.
//
// Auth-limiter budget: setup() spends up to 2 logins, and the lockout group
// deliberately burns the rest. Pass USER_TOKEN / USER2_TOKEN to avoid the
// logins, and leave ALLOW_LOCKOUT off unless you want the 15-minute lockout.

import exec from "k6/execution";
import { group } from "k6";

import { FLAGS } from "../lib/config.js";
import { authenticate, whoami } from "../lib/auth.js";
import { assertServerReachable } from "../lib/preflight.js";
import { del, get, parse, patch, post } from "../lib/client.js";
import { expectError, expectOk, finding, statusIn } from "../lib/checks.js";
import { FAKE_ID, savedAddressPayload } from "../lib/data.js";

export const options = {
  vus: 1,
  iterations: 1,
  thresholds: {
    checks: ["rate==1"],
    // When the lockout group runs it deliberately provokes 429s, so the "no
    // rate limiting during normal operation" rule is swapped for "the limiter
    // did fire". Both directions are worth asserting; only one can hold.
    ...(FLAGS.allowLockout
      ? { rate_limited_responses: ["count>0"] }
      : { rate_limited_responses: ["count==0"] }),
    http_req_failed: ["rate<0.05"],
    server_error_responses: ["count==0"],
  },
};

export function setup() {
  assertServerReachable();

  const auth = authenticate({ user: true, user2: true });

  if (!auth.user2) {
    console.warn(
      "No USER2_* credentials: cross-customer isolation checks are skipped.",
    );
  }

  // Precondition for the cross-customer groups: if both variables happen to
  // point at the same account then every isolation check below compares an
  // account with itself and passes without proving anything. Fail loudly
  // instead of reporting a green run that tested nothing.
  let userId = null;
  let user2Id = null;

  if (auth.user && auth.user2) {
    const userProfile = whoami(auth.user.token);
    const user2Profile = whoami(auth.user2.token);

    userId = userProfile && (userProfile._id || userProfile.id);
    user2Id = user2Profile && (user2Profile._id || user2Profile.id);

    if (!userId || !user2Id) {
      console.warn(
        "Could not read both profiles, so the cross-customer checks will be " +
          "less meaningful.",
      );
    } else if (userId === user2Id) {
      exec.test.abort(
        "USER_* and USER2_* resolve to the same account (" +
          userId +
          "). Point USER2 at a different customer, or the cross-customer " +
          "isolation checks prove nothing.",
      );
    } else {
      console.log(`Cross-customer checks: ${userId} vs ${user2Id}`);
    }
  }

  return {
    userToken: auth.user && auth.user.token,
    user2Token: auth.user2 && auth.user2.token,
    userId,
    user2Id,
  };
}

export default function (data) {
  const state = { addressId: null };

  try {
    group("unauthenticated access", () => unauthenticated());
    group("token handling", () => tokenHandling(data));

    if (data.userToken) {
      group("role escalation", () => roleEscalation(data));
    }

    if (data.userToken && data.user2Token) {
      group("cross-customer: session scoping", () => sessionScoping(data));
      group("cross-customer: addresses", () => addressIsolation(data, state));
      group("cross-customer: orders", () => orderIsolation(data));
    }

    if (FLAGS.allowLockout) {
      group("auth lockout", () => authLockout());
    }
  } finally {
    cleanup(data, state);
  }
}

// --- Boundaries -------------------------------------------------------------

/** Every protected route must refuse an anonymous caller. */
function unauthenticated() {
  const probes = [
    { path: "/user/profile", label: "GET /user/profile" },
    { path: "/cart", label: "GET /cart" },
    { path: "/cart/count", label: "GET /cart/count" },
    { path: "/address", label: "GET /address" },
    { path: "/wishlist", label: "GET /wishlist" },
    { path: "/order/my-orders", label: "GET /order/my-orders" },
    { path: "/order", label: "GET /order" },
    { path: "/order/stats", label: "GET /order/stats" },
    { path: "/admin/profile", label: "GET /admin/profile" },
    { path: "/invoice/000000000000000000000000", label: "GET /invoice/:orderId" },
    { path: "/coupon", label: "GET /coupon" },
    { path: "/newsletter", label: "GET /newsletter" },
    { path: "/user", label: "GET /user" },
  ];

  probes.forEach((probe) => {
    expectError(
      get(probe.path, { name: probe.label, expect: [200, 401] }),
      401,
      probe.label,
      "UNAUTHORIZED",
    );
  });

  // A write without a token must not succeed either.
  expectError(
    post("/address", {
      body: savedAddressPayload(),
      name: "POST /address",
      expect: [200, 201, 401],
    }),
    401,
    "POST /address without token",
    "UNAUTHORIZED",
  );
}

/**
 * A signature check that does not run is a check that does not protect
 * anything. A garbage or tampered token must be rejected, and must be rejected
 * as 401 rather than as an empty result set.
 */
function tokenHandling(data) {
  const garbage = "not.a.jwt.at-all";

  expectError(
    get("/user/profile", {
      token: garbage,
      name: "GET /user/profile (garbage token)",
      expect: [200, 401],
    }),
    401,
    "garbage bearer token",
    "UNAUTHORIZED",
  );

  // The signature is what matters: the victim's id in the payload must not help
  // when the token is not signed by the server. Precomputed so the test does not
  // depend on Buffer being available in the k6 runtime.
  //   header  {"alg":"none","typ":"JWT"}
  //   payload {"id":"000000000000000000000000","role":"Admin"}
  const forged =
    "eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0." +
    "eyJpZCI6IjAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMCIsInJvbGUiOiJBZG1pbiJ9.";

  expectError(
    get("/admin/profile", {
      token: forged,
      name: "GET /admin/profile (alg:none token)",
      expect: [200, 401],
    }),
    401,
    "alg:none forged token",
    "UNAUTHORIZED",
  );

  // A valid customer token must not become an admin token by swapping the
  // payload, and must not be usable after logout invalidates it.
  if (data.userToken) {
    expectError(
      get("/admin/profile", {
        token: data.userToken,
        name: "GET /admin/profile (customer token)",
        expect: [200, 401, 403],
      }),
      403,
      "customer token on admin route",
    );
  }
}

/** Customer token against admin-only routes. */
function roleEscalation(data) {
  const token = data.userToken;

  const adminOnly = [
    { path: "/order", label: "GET /order", query: { page: 1, limit: 5 } },
    { path: "/order/stats", label: "GET /order/stats" },
    { path: "/user", label: "GET /user", query: { page: 1, limit: 5 } },
    { path: "/coupon", label: "GET /coupon", query: { page: 1, limit: 5 } },
    { path: "/newsletter", label: "GET /newsletter", query: { page: 1, limit: 5 } },
    { path: "/admin/profile", label: "GET /admin/profile" },
  ];

  adminOnly.forEach((probe) => {
    expectError(
      get(probe.path, {
        token,
        query: probe.query,
        name: probe.label,
        expect: [200, 401, 403],
      }),
      403,
      `${probe.label} with customer token`,
      "FORBIDDEN",
    );
  });

  // Mutating someone else's order status is the highest-value escalation:
  // it moves money. 403 or 404 are both acceptable (404 hides existence).
  statusIn(
    patch(`/order/${FAKE_ID}`, {
      token,
      body: { orderStatus: "Cancelled" },
      name: "PATCH /order/:id (customer token)",
      expect: [200, 400, 401, 403, 404],
    }),
    [400, 401, 403, 404],
    "customer cannot change order status",
  );

  statusIn(
    del(`/order/${FAKE_ID}`, {
      token,
      name: "DELETE /order/:id (customer token)",
      expect: [200, 400, 401, 403, 404],
    }),
    [400, 401, 403, 404],
    "customer cannot delete an order",
  );
}

// --- Cross-customer isolation ------------------------------------------------

/**
 * Each token must resolve to exactly its own account. If /user/profile ever
 * returned the requester's id regardless of the token, every isolation check
 * below would still "pass" while testing nothing.
 */
function sessionScoping(data) {
  const own = whoami(data.userToken);
  const other = whoami(data.user2Token);

  const ownId = own && (own._id || own.id);
  const otherId = other && (other._id || other.id);

  expectOk(
    get("/user/profile", { token: data.userToken, name: "GET /user/profile (owner)" }),
    "owner profile",
    200,
  );
  expectOk(
    get("/user/profile", {
      token: data.user2Token,
      name: "GET /user/profile (other)",
    }),
    "other profile",
    200,
  );

  finding("the two tokens resolved to the same account", Boolean(ownId) && ownId === otherId);
  finding("owner profile did not match the id seen in setup()", Boolean(data.userId) && ownId !== data.userId);
  finding("other profile did not match the id seen in setup()", Boolean(data.user2Id) && otherId !== data.user2Id);
}

/**
 * The address endpoints are `protect` only - there is no ownership middleware
 * on the route, so ownership has to be enforced where the document is read.
 * This group proves it is, rather than assuming it.
 */
function addressIsolation(data, state) {
  const owner = data.userToken;
  const attacker = data.user2Token;

  const created = post("/address", {
    token: owner,
    body: savedAddressPayload({ label: "K6 Owner" }),
    name: "POST /address",
    expect: [200, 201, 400],
  });
  const body = expectOk(created, "owner creates address", 201);
  state.addressId = body && body.data ? body.data._id : null;

  if (!state.addressId) {
    console.warn("Could not create an address; isolation checks skipped.");
    return;
  }

  // The other customer must not see it in their own list.
  const list = get("/address", {
    token: attacker,
    name: "GET /address (other customer)",
    expect: [200, 401, 403],
  });
  const listBody = parse(list);

  const leaked = Array.isArray(listBody && listBody.data)
    ? listBody.data.some((a) => a._id === state.addressId)
    : false;

  finding(
    "another customer's address id appears in GET /address",
    leaked,
  );

  // The other customer must not be able to read, change or delete it.
  statusIn(
    patch(`/address/${state.addressId}`, {
      token: attacker,
      body: { city: "Attacker City" },
      name: "PATCH /address/:id (other customer)",
      expect: [200, 400, 401, 403, 404],
    }),
    [400, 401, 403, 404],
    "cross-customer address update",
  );

  statusIn(
    del(`/address/${state.addressId}`, {
      token: attacker,
      name: "DELETE /address/:id (other customer)",
      expect: [200, 400, 401, 403, 404],
    }),
    [400, 401, 403, 404],
    "cross-customer address delete",
  );

  // The attacker's attempts must not have damaged it: the owner still sees it
  // and the city is unchanged.
  const ownerList = get("/address", {
    token: owner,
    name: "GET /address (owner)",
    expect: [200, 401],
  });
  const ownerBody = parse(ownerList);
  const stillThere = Array.isArray(ownerBody && ownerBody.data)
    ? ownerBody.data.some(
        (a) =>
          a._id === state.addressId && String(a.city).indexOf("Attacker") === -1,
      )
    : false;

  if (!stillThere) {
    finding(
      "address was modified or deleted by a different customer (IDOR)",
      true,
    );
  } else {
    expectOk(ownerList, "owner still owns the address", 200);
  }
}

/**
 * GET /order/:id and GET /invoice/:orderId are both `protect` with no
 * ownership middleware, and GET /order/order-id/:id is `optionalAuth` by
 * design so guest receipts work. Those are the three most likely places for a
 * cross-customer read.
 *
 * A placeholder id proves the shape (404, not a crash) but cannot prove
 * ownership, so that check is informational unless a real order exists.
 */
function orderIsolation(data) {
  const attacker = data.user2Token;

  ["/order/" + FAKE_ID, "/invoice/" + FAKE_ID].forEach((path) => {
    const res = get(path, {
      token: attacker,
      name: `GET ${path.split("/").slice(1, 3).join("/")} (unknown id)`,
      expect: [200, 401, 403, 404],
    });

    // 500 would mean the handler treated a missing document as a server fault.
    statusIn(res, [400, 401, 403, 404], `${path} with unknown id`);
  });

  // The guest receipt endpoint is intentionally reachable without a token, so
  // it is not a finding that it answers anonymously. It is a finding if it
  // hands back an order belonging to a signed-in customer without a matching
  // session, which is why the check below only asserts the response shape.
  const anonymous = get(`/order/order-id/${FAKE_ID}`, {
    name: "GET /order/order-id/:id (anonymous)",
    expect: [200, 400, 401, 404],
  });

  statusIn(
    anonymous,
    [400, 401, 404],
    "anonymous receipt lookup for an unknown id",
  );

  finding(
    "GET /order/order-id/:id returned data for an id that does not exist",
    anonymous.status === 200 && parse(anonymous) && parse(anonymous).data,
  );
}

// --- Auth limiter -----------------------------------------------------------

/**
 * Deliberately burns the auth-limiter budget to prove the limiter is wired to
 * the login route. This locks the runner's IP out of auth for 15 minutes, so it
 * is opt-in via ALLOW_LOCKOUT=true.
 */
function authLockout() {
  let locked = false;
  let attempts = 0;

  // The limiter allows 10 attempts per 15 minutes; 15 is enough to prove it.
  for (let i = 0; i < 15; i++) {
    const res = post("/user/login", {
      body: { email: "lockout.probe@example.test", password: "WrongPassword!1" },
      name: "POST /user/login (lockout probe)",
      expect: [200, 400, 401, 429],
      tags: { scenario: "auth_lockout" },
    });

    attempts += 1;

    if (res.status === 429) {
      locked = true;
      break;
    }
  }

  finding(
    `auth limiter did not engage after ${attempts} failed logins (expected a 429)`,
    !locked,
  );
}

// --- Cleanup ----------------------------------------------------------------

function cleanup(data, state) {
  if (!state.addressId || !data.userToken) return;

  del(`/address/${state.addressId}`, {
    token: data.userToken,
    name: "DELETE /address/:id (cleanup)",
    expect: [200, 400, 401, 404],
  });
}