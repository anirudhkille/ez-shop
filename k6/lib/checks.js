import { check } from "k6";

import { parse } from "./client.js";
import { securityFindings } from "./metrics.js";

// Every endpoint answers with the envelope built by sendResponse():
//   { success: boolean, message: string, data: ..., pagination?: {...} }
// Errors carry a machine-readable code in data.code:
//   VALIDATION_ERROR (400), UNAUTHORIZED (401), FORBIDDEN (403),
//   NOT_FOUND (unknown route), API_ERROR (handled 4xx), INTERNAL_SERVER_ERROR.

/**
 * Asserts a successful JSON envelope and returns the parsed body (or null).
 * Never throws, so a failing check does not abort the rest of the run.
 */
export function expectOk(res, label, status = 200) {
  const body = parse(res);

  check(res, {
    [`${label} -> ${status}`]: (r) => r.status === status,
    [`${label} -> success envelope`]: () =>
      body !== null &&
      body.success === true &&
      typeof body.message === "string" &&
      "data" in body,
  });

  return body;
}

/** Asserts a failed JSON envelope with the expected status (and error code). */
export function expectError(res, status, label, code) {
  const body = parse(res);

  const checks = {
    [`${label} -> ${status}`]: (r) => r.status === status,
    [`${label} -> failure envelope`]: () =>
      body !== null && body.success === false,
  };

  if (code) {
    checks[`${label} -> code ${code}`] = () =>
      body !== null && body.data && body.data.code === code;
  }

  check(res, checks);

  return body;
}

/** Asserts the pagination block that list endpoints return. */
export function expectPagination(body, label, expected = {}) {
  const p = body ? body.pagination : null;

  check(body, {
    [`${label} -> pagination present`]: () =>
      p !== null &&
      p !== undefined &&
      typeof p.total === "number" &&
      typeof p.page === "number" &&
      typeof p.limit === "number" &&
      typeof p.totalPages === "number",
    [`${label} -> data is an array`]: () =>
      body !== null && Array.isArray(body.data),
  });

  if (expected.page !== undefined) {
    check(body, {
      [`${label} -> page ${expected.page}`]: () =>
        p !== null && p !== undefined && p.page === expected.page,
    });
  }

  if (expected.limit !== undefined) {
    check(body, {
      [`${label} -> limit ${expected.limit}`]: () =>
        p !== null && p !== undefined && p.limit === expected.limit,
      [`${label} -> no more than limit items`]: () =>
        body !== null && body.data.length <= expected.limit,
    });
  }
}

/**
 * Records behaviour that needs a human decision without failing the run.
 * Prints a warning and bumps the security_findings counter when `observed`.
 */
export function finding(label, observed) {
  if (!observed) return;

  securityFindings.add(1);
  console.warn(`FINDING: ${label}`);
}

/** Boolean assertion that shows up as a named check. */
export function assert(label, condition) {
  return check(null, { [label]: () => Boolean(condition) });
}

/** Lightweight check used inside load loops: status only, no body parsing. */
export function statusIs(res, status, label) {
  return check(res, { [`${label} -> ${status}`]: (r) => r.status === status });
}

export function statusIn(res, statuses, label) {
  return check(res, {
    [`${label} -> ${statuses.join("/")}`]: (r) => statuses.indexOf(r.status) !== -1,
  });
}
