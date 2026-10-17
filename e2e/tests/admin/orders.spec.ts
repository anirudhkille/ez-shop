import { test, expect } from '@playwright/test';
import {
  API_BASE,
  E2E_PASSWORD,
  loginAdmin,
  authenticateAdmin,
} from '../helpers/auth';
import { seedAdmin, deleteAdmin, closeSeedDb } from '../helpers/seed';
import { ApiClient } from '../helpers/api';

const newAdmin = () => ({
  email: `e2e-admin-orders.${Date.now()}.${Math.random().toString(36).slice(2, 6)}@ezshop.test`,
  password: E2E_PASSWORD,
  name: 'E2E Admin',
});

test.afterAll(async () => {
  await closeSeedDb();
});

test('admin orders list and order stats are accessible', async ({ page, request }) => {
  const account = newAdmin();
  await seedAdmin(account);
  const { token } = await loginAdmin(request, account.email, account.password);

  await authenticateAdmin({ page, token });

  const api = new ApiClient(request, API_BASE);
  api.setToken(token);

  const ordersRes = await api.get('/order');
  expect(ordersRes.ok(), `GET /api/order failed: ${await ordersRes.text()}`).toBeTruthy();

  const statsRes = await api.get('/order/stats');
  expect(statsRes.ok(), `GET /api/order/stats failed: ${await statsRes.text()}`).toBeTruthy();

  await page.goto('/dashboard/orders');
  await expect(page).toHaveURL('/dashboard/orders');
  await expect(
    page.getByRole('heading', { name: 'Orders', exact: true }),
  ).toBeVisible();

  await deleteAdmin(account.email);
});