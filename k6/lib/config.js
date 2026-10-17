// Central configuration. Everything is driven by environment variables so the
// same scripts run unchanged against local, staging or a deployed server:
//
//   k6 run -e BASE_URL=http://localhost:7777 -e USER_EMAIL=... tests/smoke.test.js

const read = (name, fallback) =>
  __ENV[name] !== undefined && __ENV[name] !== "" ? __ENV[name] : fallback;

const flag = (name, fallback = false) => {
  const value = __ENV[name];
  if (value === undefined || value === "") return fallback;
  return ["1", "true", "yes", "on"].includes(String(value).toLowerCase());
};

const number = (name, fallback) => {
  const value = Number(read(name, fallback));
  return Number.isFinite(value) ? value : fallback;
};

export const BASE_URL = read("BASE_URL", "http://localhost:7777").replace(
  /\/+$/,
  "",
);
export const API = `${BASE_URL}/api`;

// Pre-seeded accounts. Signup needs an emailed OTP, so it cannot be automated;
// create one customer and one admin up front and pass their credentials in.
// A ready-made access token (15 min lifetime) can be supplied instead, which
// skips the login call and so spends none of the 10-per-15-minute auth budget.
export const USER = {
  email: read("USER_EMAIL"),
  password: read("USER_PASSWORD"),
  token: read("USER_TOKEN"),
};

export const ADMIN = {
  email: read("ADMIN_EMAIL"),
  password: read("ADMIN_PASSWORD"),
  token: read("ADMIN_TOKEN"),
};

// Optional second customer. Only the security test uses it, to prove that one
// customer cannot read or change another customer's addresses, orders and
// invoices.
export const USER2 = {
  email: read("USER2_EMAIL"),
  password: read("USER2_PASSWORD"),
  token: read("USER2_TOKEN"),
};

export const hasUserAuth = () =>
  Boolean(USER.token || (USER.email && USER.password));
export const hasAdminAuth = () =>
  Boolean(ADMIN.token || (ADMIN.email && ADMIN.password));
export const hasUser2Auth = () =>
  Boolean(USER2.token || (USER2.email && USER2.password));

export const FLAGS = {
  // Placing COD orders sends a confirmation email through Resend, decrements
  // stock and writes orders/invoices. Off by default; opt in deliberately.
  orders: flag("ENABLE_ORDERS"),
  // Negative auth tests (wrong password, bad bodies) each spend one of the 10
  // auth-limiter attempts. Turn off if you re-run the suite back to back.
  authNegative: flag("AUTH_NEGATIVE_TESTS", true),
  // Create a throwaway category + products when the catalogue is empty so the
  // id-based endpoints have something to hit. Removed again in teardown.
  seedCatalog: flag("SEED_CATALOG", true),
  // Load tests refuse to start when the server's global rate limit is low,
  // because the result would just be a wall of 429s. Override at your own risk.
  allowRateLimited: flag("ALLOW_RATE_LIMITED"),
  // The rate-limit test deliberately locks this IP out of auth for 15 minutes.
  allowLockout: flag("ALLOW_LOCKOUT"),
};

// Load tests refuse to run when the advertised RateLimit-Limit is below this.
export const MIN_RATE_LIMIT = number("MIN_RATE_LIMIT", 100000);

export const THINK_MIN = number("THINK_MIN", 0.5);
export const THINK_MAX = number("THINK_MAX", 2);
