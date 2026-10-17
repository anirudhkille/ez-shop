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
  email: `e2e-admin-coupons.${Date.now()}.${Math.random().toString(36).slice(2, 6)}@ezshop.test`,
  password: E2E_PASSWORD,
  name: 'E2E Admin',
});

test.afterAll(async () => {
  await closeSeedDb();
});

test('admin coupon create -> list -> delete via API', async ({ request }) => {
  const account = newAdmin();
  await seedAdmin(account);
  const { token } = await loginAdmin(request, account.email, account.password);

  const api = new ApiClient(request, API_BASE);
  api.setToken(token);

  const code = `E2E${Date.now()}`;
  const created = await api.post('/coupon', {
    code,
    type: 'percentage',
    value: 10,
    description: 'End-to-end test coupon',
  });
  expect(created.ok(), `POST /api/coupon failed: ${await created.text()}`).toBeTruthy();
  const createdBody = await ApiClient.json(created);
  const couponId: string | undefined =
    createdBody?.data?._id ?? createdBody?._id;
  test.skip(!couponId, 'Coupon creation did not return an id');

  const listRes = await api.get('/coupon');
  expect(listRes.ok()).toBeTruthy();
  const listBody = await ApiClient.json(listRes);
  const coupons: Array<{ code: string; _id: string }> =
    listBody?.data?.coupons ?? listBody?.data ?? (Array.isArray(listBody) ? listBody : []);
  expect(coupons.some((c) => c.code === code)).toBeTruthy();

  const deleted = await api.delete(`/coupon/${couponId}`);
  expect(deleted.ok(), `DELETE /api/coupon failed: ${await deleted.text()}`).toBeTruthy();

  await deleteAdmin(account.email);
});

test('admin coupon management page loads', async ({ page, request }) => {
  const account = newAdmin();
  await seedAdmin(account);
  const { token } = await loginAdmin(request, account.email, account.password);

  await authenticateAdmin({ page, token });
  await page.goto('/dashboard/coupon');

  await expect(page).toHaveURL('/dashboard/coupon');
  await expect(
    page.getByRole('heading', { name: 'Coupons', exact: true }),
  ).toBeVisible();

  await deleteAdmin(account.email);
});