# k6 test suite

Load, contract and security tests for the ez-shop API (`server/`).

[k6](https://k6.io) is a load-testing tool written in JavaScript. These scripts
use it for its assertion helpers, thresholds and scenario engine, but the
"tests" are mostly API contract checks — the load profiles exist to prove the
API stays healthy while it is under concurrent traffic.

## Install

```bash
winget install k6.k6          # Windows
brew install k6               # macOS
```

k6 is a single binary and needs no `package.json` — every file here is plain
ES modules.

## Tests

| File | VUs | What it proves |
| --- | --- | --- |
| `tests/smoke.test.js` | 1 | The server is up and every main read path answers. Run first, and after every deploy. |
| `tests/functional.test.js` | 1 | Every endpoint's happy path, validation, authorisation and envelope. One iteration. |
| `tests/load.test.js` | many | The four journeys in `lib/journeys.js` under concurrent ramping VUs. No 5xx, no 429, latency budget. |
| `tests/security.test.js` | 1 | Authorisation boundaries and cross-customer IDOR. |

## Credentials

Signup needs an emailed OTP, so it cannot be automated. Create the accounts
once and pass them in:

| Variable | Used by |
| --- | --- |
| `USER_EMAIL` / `USER_PASSWORD` | customer journeys, cart, addresses |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | catalogue and coupon management, admin reads, catalog seeding |
| `USER2_EMAIL` / `USER2_PASSWORD` | second customer, for the cross-customer checks |
| `USER_TOKEN` / `ADMIN_TOKEN` / `USER2_TOKEN` | skips the login call |

A ready-made access token can be passed instead of a password. It saves auth
requests (see the limiter caveat below) but expires in 15 minutes, so it is only
useful for short runs.

Tests that need no credentials — the smoke test's public half, the load test's
anonymous browse scenario, and most of the security test — still run.

## Running

```bash
# from this directory
k6 run -e BASE_URL=http://localhost:8080 \
       -e USER_EMAIL=... -e USER_PASSWORD=... \
       -e ADMIN_EMAIL=... -e ADMIN_PASSWORD=... \
       tests/smoke.test.js

k6 run tests/functional.test.js
k6 run tests/load.test.js
k6 run -e USER2_EMAIL=... -e USER2_PASSWORD=... tests/security.test.js

k6 run --out json=results.json tests/load.test.js   # machine-readable output
```

## The rate limiter will block the load test

`config/limiter.ts` puts every request behind a global limiter of **1000
requests per 15 minutes per IP**, and the auth endpoints behind **10 per 15
minutes**.

Both are far below what a load test can generate from one machine, so
`load.test.js` calls `assertRateLimitAllowsLoad()` during setup and **aborts**
rather than reporting a wall of 429s that measures the limiter instead of the
application.

You will see one of these:

```
The server allows only 1000 requests per window per IP, so this test would
mostly measure 429s. ...
```

To actually load-test, the limiter has to give way. The three options, in the
order I would pick them:

1. **A staging deployment with the ceiling raised.** Nothing here needs to change
   in the repository, but it does need the application to allow it — see below.
2. **Make both ceilings configurable** (`RATE_LIMIT_MAX` / `AUTH_RATE_LIMIT_MAX`,
   defaulting to the current 1000 / 10) so staging can raise them without a code
   change.
3. Lower `MIN_RATE_LIMIT` and accept that the results describe the limiter, not
   the API. Useful for a smoke run, never for a real number.

### What the application needs before this can work

`DISABLE_RATE_LIMIT=true` already exists, but it only reaches `authLimiter`.
`apiLimiter` has **no bypass at all** — every request is capped, including
`GET /api/health`, which is where the advertised ceiling is read from.

So the load test cannot be unblocked by configuration alone today. The
application needs one of:

- a `skip` on `apiLimiter` honouring `DISABLE_RATE_LIMIT` / `RATE_LIMIT_MAX`, or
- a trust proxy aware `keyGenerator`, so the limiter counts real client IPs
  rather than every request appearing to come from one address.

The auth limiter matters for every test, not just the load one: the suite logs
in at most twice per run, and passing `*_TOKEN` avoids that entirely.

## Configuration

| Variable | Default | Purpose |
| --- | --- | --- |
| `BASE_URL` | `http://localhost:8080` | API origin, `/api` is appended |
| `ENABLE_ORDERS` | `false` | Checkout tests. Writes orders, decrements stock and sends a real confirmation email |
| `AUTH_NEGATIVE_TESTS` | `true` | Wrong-password and malformed-body checks. Each spends one auth attempt |
| `SEED_CATALOG` | `true` | Create a temporary category + products when the catalogue is empty |
| `ALLOW_RATE_LIMITED` | `false` | Run the load test even if the limiter is too low |
| `ALLOW_LOCKOUT` | `false` | Security test's rate-limit probe. Locks this IP out of auth for 15 minutes |
| `MIN_RATE_LIMIT` | `100000` | Minimum advertised `RateLimit-Limit` the load test requires |
| `THINK_MIN` / `THINK_MAX` | `0.5` / `2` | Seconds a VU pauses to imitate a human |

Load-test stage strings use k6's `duration:target` shorthand, so the shape of
the run is configurable without editing code:

```bash
k6 run \
  -e BROWSE_STAGES="30s:5,1m:5,1m:40,15s:0" \
  -e SHOPPER_STAGES="1m:20" \
  -e P95_MS=2500 \
  tests/load.test.js
```

## Reading the output

Custom counters, all defined in `lib/metrics.js`:

- `server_error_responses` — any 5xx. Must be zero; the API should degrade with
  4xx or 429, never crash.
- `rate_limited_responses` — any 429. Must be zero outside the lockout probe.
- `unauthorized_responses` — an authenticated request answered 401, usually an
  access token expiring mid-run.
- `security_findings` — behaviour recorded by `finding()` that needs a human
  decision. These **do not fail the run**; they print `FINDING: <what>` and are
  counted so they cannot be missed.

## Layout

```
lib/
  config.js     env-var driven configuration and feature flags
  client.js     single entry point for every HTTP call, plus counters
  checks.js     envelope, error-code and pagination assertions
  auth.js       login once in setup(), share the token with every VU
  catalog.js    discovers the catalogue, seeds a temporary one if empty
  journeys.js   the four user journeys that load.test.js drives
  metrics.js    custom counters and trends
  preflight.js  reachability and rate-limit gates
  data.js       payload builders that satisfy the server's Zod schemas
tests/
  smoke / functional / load / security
```

Nothing in `lib/` is shared with the application. The scripts only know the API
through `BASE_URL`.