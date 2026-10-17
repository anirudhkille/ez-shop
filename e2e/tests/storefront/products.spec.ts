import { test, expect } from '@playwright/test';
import { API_BASE } from '../helpers/auth';

test('storefront product list and detail pages load', async ({ page, request }) => {
  const productsRes = await request.get(`${API_BASE}/product?limit=5`);
  expect(productsRes.ok(), 'GET /api/product should succeed').toBeTruthy();
  const body = await productsRes.json();
  const products: Array<{ name: string; slug: string; _id: string }> =
    Array.isArray(body) ? body : body.data ?? [];

  test.skip(
    products.length === 0,
    'No products in the dev database to browse (seed the store first)',
  );

  const product = products[0];

  await page.goto('/products');
  await expect(page.getByRole('link', { name: /men/i }).first()).toBeVisible();

  // The detail route is /:slug/:id; wait for hydration before asserting content
  await page.goto(`/${encodeURIComponent(product.slug)}/${product._id}`);
  await expect(page).toHaveURL(`/${product.slug}/${product._id}`);
  await expect(
    page.getByRole('heading', { name: product.name }),
  ).toBeVisible({ timeout: 15_000 });

  // "Add to Cart" starts disabled until a size is selected
  const addToCart = page.getByRole('button', { name: /add to cart/i }).first();
  await expect(addToCart).toBeVisible();
  await expect(addToCart).toBeDisabled();
});
