import { test, expect } from '@playwright/test';
import {
  E2E_PASSWORD,
  loginAdmin,
  authenticateAdmin,
} from '../helpers/auth';
import { seedAdmin, deleteAdmin, closeSeedDb } from '../helpers/seed';

const newAdmin = () => ({
  email: `e2e-dash.${Date.now()}.${Math.random().toString(36).slice(2, 6)}@ezshop.test`,
  password: E2E_PASSWORD,
  name: 'E2E Admin',
});

test.afterAll(async () => {
  await closeSeedDb();
});

test('admin dashboard loads with overview stats', async ({ page, request }) => {
  const account = newAdmin();
  await seedAdmin(account);
  const { token } = await loginAdmin(request, account.email, account.password);

  await authenticateAdmin({ page, token });
  await page.goto('/dashboard');

  await expect(page).toHaveURL('/dashboard');
  await expect(
    page.getByRole('heading', { name: 'Dashboard', exact: true }),
  ).toBeVisible();
  // Stat cards come from the server aggregates, so their presence proves the
  // authenticated dashboard actually rendered (and not a 404 / error page).
  await expect(page.getByText('Total Products')).toBeVisible();
  await expect(page.getByText('Total Orders')).toBeVisible();

  await deleteAdmin(account.email);
});
