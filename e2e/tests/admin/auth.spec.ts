import { test, expect } from '@playwright/test';
import {
  E2E_PASSWORD,
  loginAdmin,
  authenticateAdmin,
} from '../helpers/auth';
import { seedAdmin, deleteAdmin, closeSeedDb } from '../helpers/seed';

const newAdmin = () => ({
  email: `e2e-admin.${Date.now()}.${Math.random().toString(36).slice(2, 6)}@ezshop.test`,
  password: E2E_PASSWORD,
  name: 'E2E Admin',
});

test.afterAll(async () => {
  await closeSeedDb();
});

test('admin can log in through the dashboard login page', async ({
  page,
  request,
}) => {
  const account = newAdmin();
  await seedAdmin(account);

  // The admin login form lives at the root of the (auth) route group.
  await page.goto('/');
  await page.getByLabel('Email').fill(account.email);
  await page.getByLabel('Password').fill(account.password);
  await page.getByRole('button', { name: /log in/i }).click();

  // Resolve the auth call first so a genuinely rejected login fails fast,
  // instead of burning the whole budget waiting for a navigation that will
  // never happen.
  await page.waitForResponse(
    (response) =>
      response.url().includes('/api/admin/login') &&
      response.request().method() === 'POST',
  );

  // Then wait on the rendered dashboard: the first visit to /dashboard in a dev
  // server compiles the route on demand, which under parallel load can take
  // well over 30s.
  await expect(
    page.getByRole('heading', { name: 'Dashboard', exact: true }),
  ).toBeVisible({ timeout: 90_000 });
  await expect(page).toHaveURL('/dashboard');
  // The success toast is unmounted by the push to /dashboard, so assert the
  // contract that actually matters: a session cookie was issued.
  const sessionCookie = (await page.context().cookies()).find(
    (cookie) => cookie.name === 'admin_token' && cookie.value,
  );
  expect(sessionCookie).toBeDefined();

  await deleteAdmin(account.email);
});

test('admin login rejects invalid credentials', async ({ page }) => {
  await page.goto('/');

  await page.getByLabel('Email').fill('nobody@ezshop.test');
  await page.getByLabel('Password').fill('WrongPassword!12345');
  await page.getByRole('button', { name: /log in/i }).click();

  await expect(page).toHaveURL('/');
  await expect(page.getByRole('alert').first()).toBeVisible({ timeout: 5_000 });
});

test('admin session cookie grants access to protected dashboard routes', async ({
  page,
  request,
}) => {
  const account = newAdmin();
  await seedAdmin(account);
  const { token } = await loginAdmin(request, account.email, account.password);

  await authenticateAdmin({ page, token });
  await page.goto('/dashboard');

  await expect(page).toHaveURL('/dashboard');
  await expect(
    page.getByRole('heading', { name: 'Dashboard', exact: true }),
  ).toBeVisible();

  await deleteAdmin(account.email);
});
