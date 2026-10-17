import { test, expect } from '@playwright/test';
import {
  E2E_PASSWORD,
  loginUser,
  authenticateStorefront,
} from '../helpers/auth';
import { seedUser, deleteUser, closeSeedDb } from '../helpers/seed';

const newAccount = () => ({
  email: `e2e-login.${Date.now()}.${Math.random().toString(36).slice(2, 6)}@ezshop.test`,
  password: E2E_PASSWORD,
  name: 'E2E Shopper',
});

test.afterAll(async () => {
  await closeSeedDb();
});

test('customer can log in with valid credentials and is redirected home', async ({
  page,
  request,
}) => {
  const account = newAccount();
  await seedUser(account);
  const { token, user } = await loginUser(request, account.email, account.password);

  await authenticateStorefront({
    page,
    email: account.email,
    token,
    name: user.name ?? account.name,
  });
  await page.goto('/');

  await expect(page).toHaveURL('/');
});

test('login shows an error for invalid credentials', async ({ page }) => {
  await page.goto('/login');

  await page.getByPlaceholder('Enter your email').fill('nobody@ezshop.test');
  await page.getByPlaceholder('Enter your password').fill('WrongPassword!12345');
  await page.getByRole('button', { name: /login/i }).click();

  await expect(page).toHaveURL('/login');
});

test('logging out clears the session and returns home', async ({
  page,
  request,
}) => {
  const account = newAccount();
  await seedUser(account);
  const { token, user } = await loginUser(request, account.email, account.password);

  await authenticateStorefront({
    page,
    email: account.email,
    token,
    name: user.name ?? account.name,
  });

  await page.goto('/account/settings');
  await expect(
    page.getByRole('button', { name: 'Log out You will need to log in again.', exact: true }),
  ).toBeVisible();

  await page.getByRole('button', { name: 'Log out You will need to log in again.', exact: true }).click();
  await expect(page).toHaveURL('/');

  await deleteUser(account.email);
});
