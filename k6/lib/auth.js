import exec from "k6/execution";

import {
  ADMIN,
  USER,
  USER2,
  hasAdminAuth,
  hasUser2Auth,
  hasUserAuth,
} from "./config.js";
import { get, parse, post } from "./client.js";

// Both login endpoints are behind authLimiter: 10 requests per 15 minutes per
// IP, successful or not. So tests log in ONCE in setup() and share the token
// with every VU. Never call login from the default function of a load test.

function acquire(role) {
  const creds = role === "admin" ? ADMIN : role === "user2" ? USER2 : USER;
  const endpoint = role === "admin" ? "admin" : "user";
  const label = role.toUpperCase();

  if (creds.token) {
    return { token: creds.token, source: "env" };
  }

  if (!creds.email || !creds.password) return null;

  const res = post(`/${endpoint}/login`, {
    body: { email: creds.email, password: creds.password },
    name: `POST /${endpoint}/login`,
    expect: [200, 401, 429],
  });

  if (res.status === 429) {
    exec.test.abort(
      `${role} login was rate limited (auth limiter allows 10 attempts per 15 min per IP). ` +
        `Wait for the window to reset, or pass ${label}_TOKEN instead.`,
    );
  }

  const body = parse(res);

  if (res.status !== 200 || !body || !body.data || !body.data.token) {
    exec.test.abort(
      `${role} login failed with status ${res.status}. Check ${label}_EMAIL / ${label}_PASSWORD.`,
    );
  }

  return { token: body.data.token, id: body.data.id, source: "login" };
}

/**
 * Logs in the accounts the run needs. Returns { user, admin, user2 } where each
 * is { token, id? } or null when no credentials were supplied for it.
 */
export function authenticate({ user = true, admin = false, user2 = false } = {}) {
  const result = { user: null, admin: null, user2: null };

  if (user && hasUserAuth()) result.user = acquire("user");
  if (admin && hasAdminAuth()) result.admin = acquire("admin");
  if (user2 && hasUser2Auth()) result.user2 = acquire("user2");

  if (user && !result.user) {
    console.warn(
      "No USER_EMAIL/USER_PASSWORD (or USER_TOKEN): customer-only checks are skipped.",
    );
  }

  if (admin && !result.admin) {
    console.warn(
      "No ADMIN_EMAIL/ADMIN_PASSWORD (or ADMIN_TOKEN): admin-only checks are skipped.",
    );
  }

  if (user2 && !result.user2) {
    console.warn(
      "No USER2_EMAIL/USER2_PASSWORD (or USER2_TOKEN): cross-customer access checks are skipped.",
    );
  }

  return result;
}

/** Fetches the signed-in customer's own profile (to learn their _id). */
export function whoami(token) {
  const res = get("/user/profile", { token, name: "GET /user/profile" });
  const body = parse(res);

  return res.status === 200 && body ? body.data : null;
}
