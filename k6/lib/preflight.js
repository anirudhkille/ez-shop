import exec from "k6/execution";

import { BASE_URL, FLAGS, MIN_RATE_LIMIT } from "./config.js";
import { get, header, parse } from "./client.js";

/**
 * The server applies a global limiter (config/limiter.ts: 1000 requests per
 * 15 minutes per IP). A load test from one machine exhausts that within
 * seconds and from then on only measures 429 responses.
 *
 * It advertises the ceiling in RateLimit-Limit headers, so check that before
 * generating load and stop with a clear message instead of a useless report.
 */
export function assertServerReachable() {
  const res = get("/health", { name: "GET /health", expect: [200] });

  if (res.status !== 200) {
    exec.test.abort(
      `Server at ${BASE_URL} is not healthy: GET /api/health returned ${res.status}.`,
    );
  }

  const body = parse(res);

  if (!body || !body.data || body.data.status !== "ok") {
    exec.test.abort("GET /api/health did not return { data: { status: 'ok' } }.");
  }

  return res;
}

export function assertRateLimitAllowsLoad() {
  const res = assertServerReachable();
  const advertised = Number(header(res, "RateLimit-Limit"));

  if (!Number.isFinite(advertised)) {
    console.warn(
      "No RateLimit-Limit header on /api/health - cannot verify the server's rate limit.",
    );
    return;
  }

  if (advertised >= MIN_RATE_LIMIT || FLAGS.allowRateLimited) {
    if (advertised < MIN_RATE_LIMIT) {
      console.warn(
        `Proceeding with a rate limit of ${advertised} requests/window (ALLOW_RATE_LIMITED=true). Expect 429s.`,
      );
    }
    return;
  }

  exec.test.abort(
    `The server allows only ${advertised} requests per window per IP, so this test would mostly measure 429s. ` +
      `Run it against a server whose limiter is raised (see server/k6/README.md), ` +
      `lower MIN_RATE_LIMIT, or set ALLOW_RATE_LIMITED=true to run anyway.`,
  );
}
