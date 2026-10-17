import { test, expect } from '@playwright/test';
import {
  API_BASE,
  E2E_PASSWORD,
  loginUser,
  authenticateStorefront,
} from '../helpers/auth';
import { seedUser, deleteUser, closeSeedDb } from '../helpers/seed';
import { ApiClient } from '../helpers/api';

const newAccount = () => ({
  email: `e2e-cart.${Date.now()}.${Math.random().toString(36).slice(2, 6)}@ezshop.test`,
  password: E2E_PASSWORD,
  name: 'E2E Shopper',
});

type Product = { _id: string; slug: string; name: string };

test.afterAll(async () => {
  await closeSeedDb();
});

/** First product in the dev catalogue, with the first available size. */
const firstSellable = async (api: ApiClient) => {
  const res = await api.get('/product?limit=1');
  expect(res.ok(), `GET /api/product failed: ${res.status()}`).toBeTruthy();

  const body = await ApiClient.json(res);
  const products: Product[] = Array.isArray(body)
    ? body
    : body?.data?.products ?? body?.data ?? [];

  test.skip(products.length === 0, 'No products in the dev database');
  const product = products[0];

  const detailRes = await api.get(`/product/${product.slug}/${product._id}`);
  const detail = await ApiClient.json(detailRes);
  const variants = detail?.data?.variants ?? detail?.variants ?? [];
  const size = variants[0]?.sizes?.[0]?.size;

  return { product, size };
};

test('cart add -> update quantity -> remove is reflected on the cart page', async ({
  page,
  request,
}) => {
  const account = newAccount();
  await seedUser(account);
  const { token } = await loginUser(request, account.email, account.password);

  await authenticateStorefront({
    page,
    email: account.email,
    token,
    name: account.name,
  });

  const api = new ApiClient(request, API_BASE);
  api.setToken(token);

  const { product, size } = await firstSellable(api);

  // Add to cart
  const addRes = await api.post('/cart', {
    productId: product._id,
    ...(size ? { size } : {}),
    quantity: 1,
  });
  expect(addRes.ok(), `POST /api/cart failed: ${await addRes.text()}`).toBeTruthy();

  await page.goto('/cart');
  await page.waitForLoadState('networkidle');

  await expect(page.getByText(product.name)).toBeVisible({ timeout: 5_000 });
  await expect(
    page.getByRole('heading', { name: /order summary/i }),
  ).toBeVisible();
  // At quantity 1 the per-unit price hint is hidden.
  await expect(page.getByText(/each$/)).toBeHidden();

  // Update quantity to 2
  const cartRes = await api.get('/cart');
  const cartBody = await ApiClient.json(cartRes);
  const items = Array.isArray(cartBody)
    ? cartBody
    : cartBody?.data?.products ?? cartBody?.data?.cartItems ?? [];
  const cartItemId: string | undefined = items[0]?._id;
  test.skip(!cartItemId, 'Cart item did not return an id');

  const updateRes = await api.put('/cart', {
    cartItemId,
    quantity: 2,
  });
  expect(updateRes.ok(), `PUT /api/cart failed: ${await updateRes.text()}`).toBeTruthy();

  await page.reload();
  await page.waitForLoadState('networkidle');

  // Quantity above 1 renders the per-unit price hint again.
  await expect(page.getByText(/each$/)).toBeVisible({ timeout: 5_000 });

  // Remove the item again
  const removeRes = await api.delete(`/cart/${cartItemId}`);
  expect(removeRes.ok(), `DELETE /api/cart failed: ${await removeRes.text()}`).toBeTruthy();

  await page.goto('/cart');
  await page.waitForLoadState('networkidle');

  await expect(
    page.getByRole('heading', { name: /your cart is empty/i }),
  ).toBeVisible({ timeout: 5_000 });

  await deleteUser(account.email);
});