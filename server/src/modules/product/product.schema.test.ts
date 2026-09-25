import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  filteredProductQuerySchema,
  productCreateSchema,
  productParamsSchema,
  productUpdateSchema,
  searchQuerySchema,
} from "./product.schema.js";

const categoryId = "507f1f77bcf86cd799439011";
const productId = "507f191e810c19729de860ea";

const validProduct = {
  name: "Classic T-shirt",
  description: "A comfortable shirt",
  price: 999,
  discountPrice: 799,
  stock: 12,
  category: categoryId,
  image: "https://example.com/shirt.jpg",
  publish: true,
  gender: "unisex" as const,
  isFeatured: false,
  isBestSellers: false,
  tag: "New" as const,
  variants: [
    {
      color: "Black",
      colorCode: "#111111",
      images: [],
      sizes: [{ size: "M", stock: 4, sku: "SHIRT-M", price: 999 }],
    },
  ],
};

describe("product schemas", () => {
  it("accepts the admin product form and multipart JSON variant fields", () => {
    assert.equal(productCreateSchema.safeParse(validProduct).success, true);
    assert.equal(
      productCreateSchema.safeParse({
        ...validProduct,
        variants: JSON.stringify(validProduct.variants),
        variantImageMap: JSON.stringify([{ variantIndex: 0, count: 1 }]),
      }).success,
      true,
    );
  });

  it("rejects invalid product values and malformed multipart JSON", () => {
    assert.equal(
      productCreateSchema.safeParse({ ...validProduct, price: 0 }).success,
      false,
    );
    assert.equal(
      productCreateSchema.safeParse({ ...validProduct, stock: -1 }).success,
      false,
    );
    assert.equal(
      productCreateSchema.safeParse({ ...validProduct, category: "bad" })
        .success,
      false,
    );
    const malformedVariants = productCreateSchema.safeParse({
      ...validProduct,
      variants: "not-json",
    });
    assert.equal(malformedVariants.success, false);
    if (!malformedVariants.success) {
      assert.ok(
        malformedVariants.error.issues.some((issue) =>
          issue.message.includes("variants must be valid JSON"),
        ),
      );
    }
    assert.equal(productCreateSchema.safeParse({}).success, false);
  });

  it("requires a non-empty partial update", () => {
    assert.equal(
      productUpdateSchema.safeParse({ name: "Updated" }).success,
      true,
    );
    assert.equal(productUpdateSchema.safeParse({}).success, false);
    assert.equal(productUpdateSchema.safeParse({ name: " " }).success, false);
  });

  it("treats blank multipart optional fields as omitted", () => {
    const result = productUpdateSchema.safeParse({
      name: "Updated",
      discountPrice: "",
      slug: "",
      publish: "",
      variants: "",
      variantImageMap: "",
    });

    assert.equal(result.success, true);
    if (result.success) {
      assert.equal(result.data.discountPrice, undefined);
      assert.equal(result.data.slug, undefined);
      assert.equal(result.data.publish, undefined);
      assert.equal(result.data.variants, undefined);
    }
  });

  it("allowlists product filters and bounds pagination", () => {
    assert.equal(
      filteredProductQuerySchema.safeParse({
        category: categoryId,
        gender: "men,women",
        sort: "price-low",
        page: "2",
        limit: "20",
      }).success,
      true,
    );
    assert.equal(
      filteredProductQuerySchema.safeParse({ sort: "password" }).success,
      false,
    );
    assert.equal(
      filteredProductQuerySchema.safeParse({ limit: "101" }).success,
      false,
    );
    assert.equal(
      searchQuerySchema.safeParse({ name: "shirt", limit: "51" }).success,
      false,
    );
  });

  it("validates slug and product id params", () => {
    assert.equal(
      productParamsSchema.safeParse({ slug: "classic-t-shirt", id: productId })
        .success,
      true,
    );
    assert.equal(
      productParamsSchema.safeParse({ slug: " ", id: productId }).success,
      false,
    );
    assert.equal(
      productParamsSchema.safeParse({ slug: "classic-t-shirt", id: "bad" })
        .success,
      false,
    );
  });
});
