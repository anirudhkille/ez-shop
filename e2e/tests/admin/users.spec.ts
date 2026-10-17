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
  email: `e2e-admin-users.${Date.now()}.${Math.random().toString(36).slice(2, 6)}@ezshop.test`,
  password: E2E_PASSWORD,
  name: 'E2E Admin',
});

test.afterAll(async () => {
  await closeSeedDb();
});

test('admin users list is accessible and API returns users', async ({ page, request }) => {
  const account = newAdmin();
  await seedAdmin(account);
  const { token } = await loginAdmin(request, account.email, account.password);

  await authenticateAdmin({ page, token });

  const api = new ApiClient(request, API_BASE);
  api.setToken(token);

  const usersRes = await api.get('/user');
  expect(usersRes.ok(), `GET /api/user failed: ${await usersRes.text()}`).toBeTruthy();
  const usersBody = await ApiClient.json(usersRes);
  const users: Array<{ email: string }> =
    usersBody?.data?.users ?? usersBody?.data ?? (Array.isArray(usersBody) ? usersBody : []);
  expect(users.length).toBeGreaterThan(0);

  await page.goto('/dashboard/users');
  await expect(page).toHaveURL('/dashboard/users');
  await expect(
    page.getByRole('heading', { name: 'Users', exact: true }),
  ).toBeVisible();

  await deleteAdmin(account.email);
});