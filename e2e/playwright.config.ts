import { defineConfig, devices } from '@playwright/test';

/**
 * End-to-end tests for ez-shop.
 *
 * What is tested
 * --------------
 *  - storefront  : customer-facing React + Vite app (http://localhost:5173)
 *  - admin       : Next.js 16 admin dashboard (http://localhost:3000)
 *  - api         : Express + Mongoose backend (http://localhost:7777/api)
 *
 * Prerequisites (see README.md)
 *  1. bun install            (in this folder)
 *  2. bun run install:browsers
 *  3. Start the three apps:
 *        bun run dev   in server/    (API)
 *        bun run dev   in client/    (storefront)
 *        bun run dev   in admin/     (dashboard)
 *     The webServer config below starts them automatically when none is running.
 *
 * Run:  bun test
 *       bun run test:headed   (watch the browser)
 */

const BASE_URLS = {
  storefront: process.env.E2E_STOREFRONT_URL ?? 'http://localhost:5173',
  admin: process.env.E2E_ADMIN_URL ?? 'http://localhost:3000',
  api: process.env.E2E_API_URL ?? 'http://localhost:7777/api',
} as const;

/** Read the port out of a base URL, falling back when it is implicit. */
const portOf = (url: string, fallback: number): number => {
  const port = new URL(url).port;
  return port ? Number(port) : fallback;
};

export default defineConfig({
  testDir: './tests',
  snapshotDir: './tests/snapshots',
  outputDir: './test-results',

  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? 'github' : 'html',

  // These tests run against *dev* servers, which compile routes on demand. A
  // cold first visit to an admin page takes tens of seconds (Next.js compiles
  // the route plus its RSC payload), which overruns Playwright's 30s default
  // test timeout. Budget generously; a real hang still fails fast enough.
  timeout: 120_000,
  expect: { timeout: 15_000 },

  // Automatically start the API, storefront, and admin dev servers.
  //
  // One entry per workspace: Playwright waits for *every* port to accept
  // connections before the first test runs, so tests never race a server that
  // is still booting (the Next.js admin app in particular takes several
  // seconds longer than Vite to bind).
  //
  // `reuseExistingServer` lets a manually started stack be picked up instead.
  webServer: [
    {
      command: 'node ./scripts/start-servers.js api',
      port: portOf(BASE_URLS.api, 7777),
      timeout: 180_000,
      reuseExistingServer: true,
    },
    {
      command: 'node ./scripts/start-servers.js storefront',
      port: portOf(BASE_URLS.storefront, 5173),
      timeout: 180_000,
      reuseExistingServer: true,
    },
    {
      command: 'node ./scripts/start-servers.js admin',
      port: portOf(BASE_URLS.admin, 3000),
      timeout: 180_000,
      reuseExistingServer: true,
    },
  ],

  use: {
    baseURL: BASE_URLS.storefront,

    // The API allows 10 auth attempts per IP per 15 minutes, which a full run
    // (let alone several runs inside one window) exceeds. This header is sent
    // on every browser and API request so auth calls skip the limiter. The
    // server only honours it when E2E_BYPASS_RATE_LIMIT=true, which
    // scripts/start-servers.js sets, and never when NODE_ENV=production.
    extraHTTPHeaders: { 'x-e2e-test': 'ezshop' },

    actionTimeout: 15_000,
    navigationTimeout: 60_000,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'storefront',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: BASE_URLS.storefront,
      },
      testMatch: /tests\/storefront\/.*\.spec\.ts/,
    },
    {
      name: 'admin',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: BASE_URLS.admin,
      },
      testMatch: /tests\/admin\/.*\.spec\.ts/,
    },
    {
      name: 'api',
      use: {
        baseURL: BASE_URLS.api,
      },
      testMatch: /tests\/api\/.*\.spec\.ts/,
    },
  ],
});
