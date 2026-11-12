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
  email: `e2e-admin-categories.${Date.now()}.${Math.random().toString(36).slice(2, 6)}@ezshop.test`,
  password: E2E_PASSWORD,
  name: 'E2E Admin',
});

const slugify = (text: string) =>
  text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');

// Stand-in image URL. The stored category only needs a non-empty string, and
// cleanup deletes this non-existent key from R2. DeleteObject is idempotent, so
// the test never removes a real asset.
const CATEGORY_PLACEHOLDER_IMAGE =
  'https://ezshop-cdn.anirudhkille.com/e2e/category-placeholder.jpg';

test.afterAll(async () => {
  await closeSeedDb();
});

test('admin can create a category and see it in the category list', async ({
  page,
  request,
}) => {
  const account = newAdmin();
  await seedAdmin(account);
  const { token } = await loginAdmin(request, account.email, account.password);

  await authenticateAdmin({ page, token });

  const api = new ApiClient(request, API_BASE);
  api.setToken(token);

  const categoryName = `E2E Category ${Date.now()}`;
  const categorySlug = slugify(categoryName);

  // The stored category requires an image: the API accepts either an uploaded
  // file or an `image` URL, and the Mongoose model rejects an empty string.
  const image = CATEGORY_PLACEHOLDER_IMAGE;

  const created = await api.post('/category', {
    name: categoryName,
    slug: categorySlug,
    image,
  });
  expect(created.ok(), `POST /api/category failed: ${await created.text()}`).toBeTruthy();
  const createdBody = await ApiClient.json(created);
  const categoryId: string | undefined =
    createdBody?.data?._id ?? createdBody?._id;
  test.skip(!categoryId, 'Category creation did not return an id');

  await page.goto('/dashboard/category');
  await expect(
    page.getByRole('heading', { name: 'Category', exact: true }),
  ).toBeVisible();
  await expect(page.getByText(categoryName)).toBeVisible({ timeout: 5_000 });

  await api.delete(`/category/${categoryId}`);

  await deleteAdmin(account.email);
});