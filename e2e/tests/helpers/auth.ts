import type { APIRequestContext, Page } from '@playwright/test';

export const E2E_PASSWORD = 'EzShop.E2E@Test1234!';
/**
 * Base URL of the API under test. Kept in sync with `playwright.config.ts` so
 * pointing the suite at another host only takes one env var.
 */
export const API_BASE = process.env.E2E_API_URL ?? 'http://localhost:7777/api';

export interface AuthAccount {
  email: string;
  password: string;
  name: string;
}

/**
 * Sign into the customer storefront by injecting the access token into the
 * zustand persisted store (localStorage key "user-store"), exactly as the app
 * does after a successful login. This is much faster and more reliable than
 * typing through the login form for tests that need an authenticated session.
 *
 * Call before page.goto() so the app boots already authenticated.
 */
export async function authenticateStorefront({
  page,
  email,
  token,
  name = 'E2E User',
}: {
  page: Page;
  email: string;
  token: string;
  name?: string;
}) {
  await page.addInitScript(
    ({ email, token, name }) => {
      const store = { state: { token, name, email } };
      window.localStorage.setItem('user-store', JSON.stringify(store));
    },
    { email, token, name },
  );

  // If the page already loaded (e.g. reused across tests), apply storage and
  // reload so the running app picks the session up.
  if (page.url() !== 'about:blank') {
    await page.evaluate(({ email, token, name }) => {
      const store = { state: { token, name, email }, version: 4 };
      window.localStorage.setItem('user-store', JSON.stringify(store));
      window.location.reload();
    }, { email, token, name });
    await page.waitForLoadState('domcontentloaded');
  }
}

/**
 * Sign into the admin dashboard by setting the "admin_token" cookie, exactly
 * as the app does after POST /api/admin/login.
 */
export async function authenticateAdmin({
  page,
  token,
}: {
  page: Page;
  token: string;
}) {
  await page.context().addCookies([
    {
      name: 'admin_token',
      value: token,
      domain: 'localhost',
      path: '/',
      httpOnly: false,
      sameSite: 'Lax',
    },
  ]);

  if (page.url() !== 'about:blank') {
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
  }
}

/** Log in a customer via the API; returns the access token and user payload. */
export async function loginUser(
  request: APIRequestContext,
  email: string,
  password: string,
) {
  const res = await request.fetch(`${API_BASE}/user/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-e2e-test': 'ezshop',
    },
    data: JSON.stringify({ email, password }),
  });
  if (!res.ok()) {
    throw new Error(
      `Customer login failed for ${email}: ${res.status()} ${await res.text()}`,
    );
  }
  const body = await res.json();
  return { token: body.data.token, user: body.data };
}

/** Log in an admin via the API; returns the access token and admin payload. */
export async function loginAdmin(
  request: APIRequestContext,
  email: string,
  password: string,
) {
  const res = await request.fetch(`${API_BASE}/admin/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-e2e-test': 'ezshop',
    },
    data: JSON.stringify({ email, password }),
  });
  if (!res.ok()) {
    throw new Error(
      `Admin login failed for ${email}: ${res.status()} ${await res.text()}`,
    );
  }
  const body = await res.json();
  return { token: body.data.token, user: body.data };
}
