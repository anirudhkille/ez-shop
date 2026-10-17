# ez-shop E2E tests (Playwright)

End-to-end tests for the whole **ez-shop** monorepo:

| Project | App | URL |
|---------|-----|-----|
| `storefront` | Customer storefront (React + Vite) | `http://localhost:5173` |
| `admin` | Admin dashboard (Next.js 16) | `http://localhost:3000` |
| `api` | Backend REST API (Express + Mongoose) | `http://localhost:7777/api` |

## What is covered

- **Storefront:** login / invalid credentials / logout, product list & detail, add to cart, cart quantity update & removal, checkout contact → delivery → payment with order totals, account settings.
- **Admin:** login / invalid credentials / session cookie, dashboard, products (create via API + see in list), categories (create via API + see in list), coupons (create → list → delete), orders list + stats, users list.
- **API:** public catalog/categories, login validation, 401 on protected routes without a token, customer & admin login contracts, admin orders with/without a token.

## How authentication works in tests

Tests do not click through email OTP flows (those send real emails). Instead:

- Test accounts are seeded directly into MongoDB (`server/.env` `MONGO_URI`, database `test`) with bcrypt-hashed passwords.
- Sessions are established through the real login endpoints (`POST /api/user/login`, `POST /api/admin/login`).
- The storefront session is injected into `localStorage` ("user-store" zustand store); the admin session is set as the `admin_token` cookie — exactly what the apps do after login.

### Rate limiting

The API allows only 10 auth attempts per IP per 15 minutes, which a full run
exceeds. `scripts/start-servers.js` therefore launches the API with
`E2E_BYPASS_RATE_LIMIT=true`, and `playwright.config.ts` sends the
`x-e2e-test: ezshop` header on every browser and API request via
`extraHTTPHeaders`, so auth calls skip `authLimiter`. The server ignores that
flag when `NODE_ENV=production`, so the header can never disable rate limiting
in a deployed environment.

### App routes used by the tests

| Screen | URL |
|--------|-----|
| Storefront login | `http://localhost:5173/login` |
| Admin login | `http://localhost:3000/` (root of the `(auth)` route group) |
| Admin dashboard | `http://localhost:3000/dashboard` |

## Prerequisites

1. **Install dependencies** (in this folder):
   ```bash
   bun install
   ```
2. **Install Playwright browsers** (Chromium):
   ```bash
   bun run install:browsers
   ```
3. **Start the three apps** (each in its own terminal):
   ```bash
   # terminal 1
   cd server && bun run dev        # http://localhost:7777
   # terminal 2
   cd client && bun run dev        # http://localhost:5173
   # terminal 3
   cd admin && bun run dev         # http://localhost:3000
   ```
   Alternatively, let Playwright start them for you (see `webServer` in `playwright.config.ts` — running `bun test` will launch `scripts/start-servers.js` if port 5173 is not already listening).

The tests run against your **local development stack**, including the real MongoDB database from `server/.env`. They seed accounts with unique emails per run and delete them afterwards.

## Running

```bash
# headed (watch the browser)
bun run test:headed

# full CI run (html report)
bun test
bun run report

# UI mode
bun run test:ui

# a single project
bun test --project storefront
bun test --project admin
bun test --project api

# a single file
bun test tests/storefront/auth.spec.ts
```

## CI

On CI set `CI=true` so Playwright uses the GitHub reporter, retries failed tests
twice, and limits workers. `webServer` starts the three dev servers itself and
waits for every port, so no separate startup step is needed — but MongoDB (with
the `server/.env` credentials) must be reachable.

## Files

- `playwright.config.ts` — test config, 3 projects, one `webServer` entry per port
- `tests/helpers/api.ts` — typed API client wrapper
- `tests/helpers/auth.ts` — login + session injection helpers
- `tests/helpers/seed.ts` — MongoDB account seeding (bypasses email OTP)
- `tests/storefront/` — customer storefront tests
- `tests/admin/` — admin dashboard tests
- `tests/api/` — backend contract tests
- `scripts/start-servers.js` — launches one workspace (`bun run dev`) for `webServer`
