import { test, expect } from '@playwright/test';
import {
  E2E_PASSWORD,
  loginUser,
  authenticateStorefront,
} from '../helpers/auth';
import { seedUser, deleteUser, closeSeedDb } from '../helpers/seed';

const newAccount = () => ({
  email: `e2e-account.${Date.now()}.${Math.random().toString(36).slice(2, 6)}@ezshop.test`,
  password: E2E_PASSWORD,
  name: 'E2E Shopper',
});

test.afterAll(async () => {
  await closeSeedDb();
});

test('account settings show the profile and logging out ends the session', async ({
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
  await expect(page.getByText(account.email).first()).toBeVisible();

  await page.getByRole('button', { name: 'Log out You will need to log in again.', exact: true }).click();
  await expect(page).toHaveURL('/');

  await deleteUser(account.email);
});
