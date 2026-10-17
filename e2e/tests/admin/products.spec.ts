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
  email: `e2e-admin-products.${Date.now()}.${Math.random().toString(36).slice(2, 6)}@ezshop.test`,
  password: E2E_PASSWORD,
  name: 'E2E Admin',
});

const slugify = (text: string) =>
  text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');

test.afterAll(async () => {
  await closeSeedDb();
});

test('admin can create a product and see it in the product list', async ({
  page,
  request,
}) => {
  const account = newAdmin();
  await seedAdmin(account);
  const { token } = await loginAdmin(request, account.email, account.password);

  await authenticateAdmin({ page, token });

  const api = new ApiClient(request, API_BASE);
  api.setToken(token);

  // Ensure a category exists to reference from the product
  const categoriesRes = await api.get('/category');
  expect(categoriesRes.ok()).toBeTruthy();
  const categoriesBody = await ApiClient.json(categoriesRes);
  const categories: Array<{ _id: string; name: string }> =
    categoriesBody?.data?.categories ??
    categoriesBody?.data ??
    (Array.isArray(categoriesBody) ? categoriesBody : []);

  let categoryId = categories[0]?._id;
  if (!categoryId) {
    const categoryName = `E2E Category ${Date.now()}`;
    const createdCategory = await api.post('/category', {
      name: categoryName,
      slug: slugify(categoryName),
      image: 'https://res.cloudinary.com/ez-shop-e2e/image/upload/e2e-category-placeholder.jpg',
    });
    expect(createdCategory.ok(), `POST /api/category failed: ${await createdCategory.text()}`).toBeTruthy();
    categoryId = (await ApiClient.json(createdCategory))?.data?._id ?? (await ApiClient.json(createdCategory))?._id;
    test.skip(!categoryId, 'Could not create a category for product tests');
  }

  const productName = `E2E Product ${Date.now()}`;
  const created = await api.post('/product', {
    name: productName,
    description: 'End-to-end test product created by Playwright',
    price: 1_499,
    stock: 25,
    category: categoryId,
    gender: 'unisex',
  });
  expect(created.ok(), `POST /api/product failed: ${await created.text()}`).toBeTruthy();
  const createdBody = await ApiClient.json(created);
  const productId: string | undefined =
    createdBody?.data?._id ?? createdBody?._id;
  test.skip(!productId, 'Product creation did not return an id');

  // The admin product list should surface the newly created product
  await page.goto('/dashboard/products');
  await expect(page).toHaveURL('/dashboard/products');
  await expect(
    page.getByRole('heading', { name: 'Products', exact: true }),
  ).toBeVisible();
  await expect(page.getByText(productName)).toBeVisible({ timeout: 5_000 });

  // Cleanup: remove the test product
  const deleted = await api.delete(`/product/${productId}`);
  expect(deleted.ok() || deleted.status() === 404, `DELETE /api/product failed: ${deleted.status()}`).toBeTruthy();

  await deleteAdmin(account.email);
});