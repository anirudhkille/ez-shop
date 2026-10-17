// LOAD: the missing consumer of lib/journeys.js.
//
// Drives the four journeys that module exports (anonymous browse, signed-in
// shopper, admin dashboard reads and guest COD checkout) as concurrent VUs with
// ramping stages, and asserts the API stays healthy while it does.
//
// What makes this different from functional.test.js: that one checks contracts
// with a single VU and one iteration. This one measures behaviour under
// concurrency - it is looking for 5xx, lockouts and latency drift, not for
// correct field names.
//
//   k6 run -e BASE_URL=http://localhost:8080 \
//          -e USER_EMAIL=... -e USER_PASSWORD=... \
//          -e ADMIN_EMAIL=... -e ADMIN_PASSWORD=... \
//          tests/load.test.js
//
// Authentication happens once in setup(). The auth limiter allows 10 attempts
// per IP per 15 minutes, so logging in per VU would exhaust the budget within
// the first seconds and the rest of the run would only measure 429s. Every VU
// therefore shares one token.
//
// The API's global limiter (1000 requests / 15 min / IP) is lower than a load
// test can consume, so assertRateLimitAllowsLoad() refuses to start against a
// server that would just answer 429. Raise the limiter first, or point BASE_URL
// at a staging host. See README.md.

import { FLAGS } from "../lib/config.js";
import { authenticate } from "../lib/auth.js";
import { prepareCatalog, removeSeed } from "../lib/catalog.js";
import { assertRateLimitAllowsLoad } from "../lib/preflight.js";
import {
  adminJourney,
  browseJourney,
  guestCheckoutJourney,
  shopperJourney,
} from "../lib/journeys.js";

// Stage strings use k6's "duration:target" shorthand for ramping-vus, so the
// whole shape of the test is overridable without editing this file:
//   -e BROWSE_STAGES="30s:5,1m:5,30s:20,1m:20,15s:0"
const DEFAULTS = {
  BROWSE_STAGES: "30s:5,1m:5,30s:20,1m:20,15s:0",
  SHOPPER_STAGES: "30s:3,1m:3,30s:8,1m:8,15s:0",
  ADMIN_STAGES: "30s:1,1m:1,30s:2,1m:2,15s:0",
  GUEST_STAGES: "15s:1,1m:1,15s:0",
  GRACEFUL_RAMPDOWN: "30s",
};

function stages(name) {
  const raw = __ENV[name];
  return raw && String(raw) !== "" ? String(raw) : DEFAULTS[name];
}

function hasCreds(role) {
  if (__ENV[`${role}_TOKEN`]) return true;

  const email = __ENV[`${role}_EMAIL`];
  const password = __ENV[`${role}_PASSWORD`];

  return Boolean(email && password);
}

function ramping(exec, stageKey, journey) {
  return {
    executor: "ramping-vus",
    exec,
    startVUs: 0,
    stages: stages(stageKey),
    gracefulRampDown: __ENV.GRACEFUL_RAMPDOWN || DEFAULTS.GRACEFUL_RAMPDOWN,
    tags: { journey },
  };
}

/**
 * Scenarios are assembled here instead of declared as a literal so that one
 * without credentials simply does not exist. k6 aborts on a scenario whose
 * exec is missing, and an unauthenticated shopper scenario would only measure
 * 401s.
 *
 * This runs while k6 is evaluating options, before setup(), so it can only ask
 * "were credentials supplied?" - setup() still aborts with a clear message if
 * the login itself is rejected.
 */
function buildScenarios() {
  const built = { browse: ramping("browse", "BROWSE_STAGES", "browse") };

  if (hasCreds("USER")) {
    built.shopper = ramping("shopper", "SHOPPER_STAGES", "shopper");
  } else {
    console.warn(
      "No USER_EMAIL/USER_PASSWORD (or USER_TOKEN): the shopper scenario is skipped.",
    );
  }

  if (hasCreds("ADMIN")) {
    built.admin = ramping("admin", "ADMIN_STAGES", "admin");
  } else {
    console.warn(
      "No ADMIN_EMAIL/ADMIN_PASSWORD (or ADMIN_TOKEN): the admin scenario is skipped.",
    );
  }

  // Write-heavy: creates an order and an invoice, decrements stock and sends a
  // confirmation email per iteration. Off unless explicitly enabled.
  if (FLAGS.orders) {
    built.guest_checkout = ramping(
      "guestCheckout",
      "GUEST_STAGES",
      "guest_checkout",
    );
  }

  // Anonymous browse traffic is always available, so there is always at least
  // one scenario and this run is never silently empty.
  return built;
}

export const options = {
  gracefulStop: __ENV.GRACEFUL_STOP || "30s",
  summaryTrendStats: ["avg", "min", "med", "p(90)", "p(95)", "p(99)", "max"],
  scenarios: buildScenarios(),
  thresholds: {
    // The point of the run: no 5xx and no limiter interference at all. A single
    // crash under load is a real defect, so these are hard failures.
    server_error_responses: ["count==0"],
    rate_limited_responses: ["count==0"],

    // Application health. Deliberately tolerant: shopper VUs share one account,
    // so cart writes can legitimately collide (the journeys already accept
    // 400/404 for that). A 99% floor still catches a systematic failure.
    checks: ["rate>0.99"],
    http_req_failed: ["rate<0.01"],

    // Latency budget for the whole API. Tighten or relax per environment:
    //   -e P95_MS=2500
    http_req_duration: [
      `p(95)<${__ENV.P95_MS || 1000}`,
      `p(99)<${__ENV.P99_MS || 2500}`,
    ],
  },
};

export function setup() {
  assertRateLimitAllowsLoad();

  const auth = authenticate({ user: true, admin: true });
  const { catalog, seeded } = prepareCatalog(auth.admin && auth.admin.token);

  if (catalog.products.length === 0) {
    console.warn(
      "Catalogue is empty. Browse traffic will still run, but product detail, " +
        "similar products, reviews and every cart write will be skipped.",
    );
  }

  return {
    userToken: auth.user && auth.user.token,
    adminToken: auth.admin && auth.admin.token,
    catalog,
    seeded,
  };
}

export function browse(data) {
  browseJourney(data.catalog, { scenario: "browse" });
}

export function shopper(data) {
  // Guard again: setup() may have had credentials that were then rejected, and
  // a shopper VU with a null token would send unauthenticated reads that look
  // like application failures.
  if (!data.userToken) return;

  shopperJourney(data.userToken, data.catalog, { scenario: "shopper" });
}

export function admin(data) {
  if (!data.adminToken) return;

  adminJourney(data.adminToken, { scenario: "admin" });
}

export function guestCheckout(data) {
  guestCheckoutJourney(data.catalog, { scenario: "guest_checkout" });
}

export function teardown(data) {
  removeSeed(data.adminToken, data.seeded);
}