import { test, expect } from '@playwright/test';
import {
  API_BASE,
  E2E_PASSWORD,
  loginUser,
  loginAdmin,
} from '../helpers/auth';
import { seedUser, seedAdmin, closeSeedDb } from '../helpers/seed';

const customer = {
  email: `e2e-api-customer.${Date.now()}.${Math.random().toString(36).slice(2, 6)}@ezshop.test`,
  password: E2E_PASSWORD,
  name: 'E2E API Customer',
};
const adminAccount = {
  email: `e2e-api-admin.${Date.now()}.${Math.random().toString(36).slice(2, 6)}@ezshop.test`,
  password: E2E_PASSWORD,
  name: 'E2E API Admin',
};

test.beforeAll(async () => {
  await seedUser(customer);
  await seedAdmin(adminAccount);
});

test.afterAll(async () => {
  await closeSeedDb();
});

test('public product catalog is reachable', async ({ request }) => {
  const res = await request.get(`${API_BASE}/product?limit=3`);
  expect(res.ok(), `GET /api/product failed: ${res.status()}`).toBeTruthy();
  const body = await res.json();
  expect(body).toBeDefined();
});

test('public categories list is reachable', async ({ request }) => {
  const res = await request.get(`${API_BASE}/category`);
  expect(res.ok(), `GET /api/category failed: ${res.status()}`).toBeTruthy();
});

test('login without body fails validation', async ({ request }) => {
  const res = await request.post(`${API_BASE}/user/login`, {
    headers: { 'Content-Type': 'application/json' },
    data: JSON.stringify({}),
  });
  expect(res.status()).toBe(400);
});

test('protected profile endpoint returns 401 without a token', async ({
  request,
}) => {
  const res = await request.get(`${API_BASE}/user/profile`);
  expect(res.status()).toBe(401);
});

test('customer login returns an access token', async ({ request }) => {
  const res = await request.post(`${API_BASE}/user/login`, {
    headers: { 'Content-Type': 'application/json' },
    data: JSON.stringify({ email: customer.email, password: customer.password }),
  });
  expect(res.ok(), `Customer login failed: ${res.status()} ${await res.text()}`).toBeTruthy();
  const body = await res.json();
  expect(typeof body.data.token).toBe('string');
  expect(body.data.email).toBe(customer.email);
});

test('admin login returns an access token', async ({ request }) => {
  const res = await request.post(`${API_BASE}/admin/login`, {
    headers: { 'Content-Type': 'application/json' },
    data: JSON.stringify({ email: adminAccount.email, password: adminAccount.password }),
  });
  expect(res.ok(), `Admin login failed: ${res.status()} ${await res.text()}`).toBeTruthy();
  const body = await res.json();
  expect(typeof body.data.token).toBe('string');
});

test('admin orders endpoint requires an admin token', async ({ request }) => {
  const unauthed = await request.get(`${API_BASE}/order`);
  expect(unauthed.status()).toBe(401);

  const { token } = await loginAdmin(
    request,
    adminAccount.email,
    adminAccount.password,
  );
  const authed = await request.get(`${API_BASE}/order`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  expect(authed.ok(), `GET /api/order failed: ${authed.status()}`).toBeTruthy();
});