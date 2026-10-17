import { FLAGS } from "./config.js";
import { del, get, parse, post } from "./client.js";
import { categoryPayload, productPayload } from "./data.js";

/**
 * Reads what is already in the store so id-based endpoints (product detail,
 * similar products, reviews, cart) have real targets.
 * Returns { categories: [{id,name,slug}], products: [{id,slug,name,stock,variants}] }.
 */
export function discoverCatalog() {
  const categories = [];
  const products = [];

  const cat = get("/category", {
    query: { limit: 100 },
    name: "GET /category",
  });
  const catBody = parse(cat);

  if (cat.status === 200 && catBody && Array.isArray(catBody.data)) {
    catBody.data.forEach((c) =>
      categories.push({ id: c._id, name: c.name, slug: c.slug }),
    );
  }

  const prod = get("/product", {
    query: { publish: "true", limit: 50 },
    name: "GET /product",
  });
  const prodBody = parse(prod);

  if (prod.status === 200 && prodBody && Array.isArray(prodBody.data)) {
    prodBody.data.forEach((p) =>
      products.push({
        id: p._id,
        slug: p.slug,
        name: p.name,
        stock: p.stock,
        variants: p.variants || [],
      }),
    );
  }

  return { categories, products };
}

/**
 * Creates one category and `count` products through the admin API. Used only
 * when the catalogue is empty; returns what it made so teardown can remove it.
 */
export function seedCatalog(adminToken, count = 6) {
  const seeded = { categoryId: null, productIds: [] };

  const catRes = post("/category", {
    token: adminToken,
    body: categoryPayload(),
    name: "POST /category",
    expect: [201, 400, 403],
  });
  const catBody = parse(catRes);

  if (catRes.status !== 201 || !catBody) {
    console.warn(`Could not seed a category (status ${catRes.status}).`);
    return seeded;
  }

  seeded.categoryId = catBody.data._id;

  for (let i = 0; i < count; i++) {
    const res = post("/product", {
      token: adminToken,
      body: productPayload(seeded.categoryId, {
        isFeatured: i % 2 === 0,
        isBestSellers: i % 3 === 0,
      }),
      name: "POST /product",
      expect: [201, 400, 403],
    });
    const body = parse(res);

    if (res.status === 201 && body) seeded.productIds.push(body.data._id);
  }

  return seeded;
}

export function removeSeed(adminToken, seeded) {
  if (!seeded || !adminToken) return;

  seeded.productIds.forEach((id) =>
    del(`/product/${id}`, {
      token: adminToken,
      name: "DELETE /product/:id",
      expect: [200, 404],
    }),
  );

  if (seeded.categoryId) {
    del(`/category/${seeded.categoryId}`, {
      token: adminToken,
      name: "DELETE /category/:id",
      expect: [200, 404],
    });
  }
}

/**
 * Standard setup step for the multi-VU tests: discover the catalogue and, if
 * it is empty and an admin token is available, seed a throwaway one.
 */
export function prepareCatalog(adminToken) {
  let catalog = discoverCatalog();
  let seeded = null;

  if (catalog.products.length === 0 && FLAGS.seedCatalog && adminToken) {
    console.log("Catalogue is empty - seeding a temporary one.");
    seeded = seedCatalog(adminToken);
    catalog = discoverCatalog();
  }

  if (catalog.products.length === 0) {
    console.warn(
      "No products found. Id-based requests (product detail, cart) will be skipped. " +
        "Provide ADMIN credentials so a temporary catalogue can be seeded.",
    );
  }

  return { catalog, seeded };
}
