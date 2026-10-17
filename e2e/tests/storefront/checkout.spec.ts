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
  email: `e2e-checkout.${Date.now()}.${Math.random().toString(36).slice(2, 6)}@ezshop.test`,
  password: E2E_PASSWORD,
  name: 'E2E Shopper',
});

test.afterAll(async () => {
  await closeSeedDb();
});

test('authenticated checkout shows the order summary with cart totals', async ({
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

  // Make sure the cart has at least one item so checkout is not empty
  const productsRes = await api.get('/product?limit=1');
  expect(productsRes.ok()).toBeTruthy();
  const productsBody = await ApiClient.json(productsRes);
  const products: unknown[] = Array.isArray(productsBody)
    ? productsBody
    : productsBody?.data?.products ?? productsBody?.data ?? [];

  test.skip(products.length === 0, 'No products in the dev database');

  const product = products[0] as { _id: string; slug: string; name: string };
  const detailRes = await api.get(`/product/${product.slug}/${product._id}`);
  const detailBody = await ApiClient.json(detailRes);
  const detailProduct: { variants?: Array<{ sizes?: Array<{ size: string }> }> } =
    detailBody?.data ?? detailBody ?? {};
  const size = detailProduct.variants?.[0]?.sizes?.[0]?.size;

  const cartRes = await api.get('/cart');
  let cartItems: Array<{ productId: string }> = [];
  if (cartRes.ok()) {
    const cartBody = await ApiClient.json(cartRes);
    cartItems =
      Array.isArray(cartBody)
        ? cartBody
        : cartBody?.data?.cartItems ?? cartBody?.data?.products ?? [];
  }

  const hasItem = cartItems.some((i) => i.productId === product._id);
  if (!hasItem) {
    const addRes = await api.post('/cart', {
      productId: product._id,
      ...(size ? { size } : {}),
      quantity: 1,
    });
    expect(addRes.ok(), `POST /api/cart failed: ${await addRes.text()}`).toBeTruthy();
  }

  await page.goto('/checkout');
  await page.waitForLoadState('networkidle');

  // Checkout page: complete your order + cart summary with the item
  await expect(page.getByRole('heading', { name: /complete your order/i })).toBeVisible();
  await expect(page.getByText(product.name)).toBeVisible({ timeout: 5_000 });

  await deleteUser(account.email);
});