import { z } from "zod";

import {
  idParamSchema,
  nonEmptyString,
  objectIdSchema,
} from "@/validation/common.schema";

const cleanNumberInput = (value: unknown) => {
  if (typeof value === "string") {
    return value.trim() === "" ? undefined : value;
  }

  if (value === null || typeof value === "boolean" || Array.isArray(value)) {
    return Number.NaN;
  }

  if (typeof value === "object") {
    return Number.NaN;
  }

  return value;
};

const positiveNumberSchema = z.preprocess(
  cleanNumberInput,
  z.coerce.number().positive("Price must be a positive number"),
);

const nonNegativeNumberSchema = z.preprocess(
  cleanNumberInput,
  z.coerce.number().nonnegative("Value must be zero or greater"),
);

const stockSchema = z.preprocess(
  cleanNumberInput,
  z.coerce
    .number()
    .int("Stock must be an integer")
    .min(0, "Stock must be zero or greater"),
);

const nonNegativeIntegerSchema = z.preprocess(
  cleanNumberInput,
  z.coerce.number().int().min(0),
);

const booleanSchema = z.preprocess((value) => {
  if (value === "true") return true;
  if (value === "false") return false;
  return value;
}, z.boolean());

const optionalNonEmptyString = z.preprocess(
  (value) =>
    typeof value === "string" && value.trim() === "" ? undefined : value,
  nonEmptyString.optional(),
);

const parseJsonInput = (
  value: unknown,
  ctx: z.RefinementCtx,
  fieldName: string,
) => {
  if (typeof value !== "string") return value;

  try {
    return JSON.parse(value);
  } catch {
    ctx.addIssue({
      code: "custom",
      message: `${fieldName} must be valid JSON`,
    });
    return undefined;
  }
};

export const productVariantSizeSchema = z.object({
  size: nonEmptyString,
  stock: stockSchema,
  sku: optionalNonEmptyString,
  price: nonNegativeNumberSchema.optional(),
  discountPrice: nonNegativeNumberSchema.optional(),
});

export const productVariantSchema = z.object({
  color: nonEmptyString,
  colorCode: optionalNonEmptyString,
  images: z.array(nonEmptyString).default([]),
  sizes: z.array(productVariantSizeSchema).default([]),
});

const variantArraySchema = z.array(productVariantSchema);
const productVariantsSchema = z.preprocess(
  (value, ctx) => parseJsonInput(value, ctx, "variants"),
  variantArraySchema.default([]),
);
const productVariantsUpdateSchema = z.preprocess(
  (value, ctx) => parseJsonInput(value, ctx, "variants"),
  variantArraySchema.optional(),
);

export const variantImageMapItemSchema = z.object({
  variantIndex: nonNegativeIntegerSchema,
  count: nonNegativeIntegerSchema,
});

const variantImageMapArraySchema = z.array(variantImageMapItemSchema);
const productVariantImageMapSchema = z.preprocess(
  (value, ctx) => parseJsonInput(value, ctx, "variantImageMap"),
  variantImageMapArraySchema.optional(),
);

const productFields = {
  name: nonEmptyString,
  description: nonEmptyString,
  price: positiveNumberSchema,
  discountPrice: nonNegativeNumberSchema.optional(),
  stock: stockSchema,
  category: objectIdSchema,
  image: nonEmptyString.optional(),
  publish: booleanSchema,
  gender: z.enum(["men", "women", "unisex"]),
  isFeatured: booleanSchema,
  isBestSellers: booleanSchema,
  tag: z.enum(["Best Seller", "Trending", "Limited", "New", "Hot", "Sale"]),
  slug: nonEmptyString.optional(),
};

export const productCreateSchema = z.object({
  ...productFields,
  publish: productFields.publish.default(true),
  gender: productFields.gender.default("unisex"),
  isFeatured: productFields.isFeatured.default(false),
  isBestSellers: productFields.isBestSellers.default(false),
  tag: productFields.tag.default("New"),
  variants: productVariantsSchema,
  variantImageMap: productVariantImageMapSchema,
});

export const productUpdateSchema = z
  .object({
    name: productFields.name.optional(),
    description: productFields.description.optional(),
    price: productFields.price.optional(),
    discountPrice: productFields.discountPrice,
    stock: productFields.stock.optional(),
    category: productFields.category.optional(),
    image: productFields.image,
    publish: productFields.publish.optional(),
    gender: productFields.gender.optional(),
    isFeatured: productFields.isFeatured.optional(),
    isBestSellers: productFields.isBestSellers.optional(),
    tag: productFields.tag.optional(),
    slug: productFields.slug,
    variants: productVariantsUpdateSchema,
    variantImageMap: productVariantImageMapSchema,
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one product field is required",
  });

const productBooleanQuerySchema = z.enum(["true", "false"]);

export const productQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  publish: productBooleanQuerySchema.optional(),
  isFeatured: productBooleanQuerySchema.optional(),
  isNewArrival: productBooleanQuerySchema.optional(),
});

export const searchQuerySchema = z.object({
  name: nonEmptyString,
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

const categoryFilterSchema = z
  .string()
  .trim()
  .refine(
    (value) =>
      value.length > 0 &&
      value.split(",").every((id) => objectIdSchema.safeParse(id).success),
    { message: "Invalid category" },
  );

const genderFilterSchema = z
  .string()
  .trim()
  .refine(
    (value) =>
      value.length > 0 &&
      value
        .split(",")
        .every((item) =>
          ["men", "women", "unisex"].includes(item.toLowerCase()),
        ),
    { message: "Invalid gender" },
  );

const typeFilterSchema = z
  .string()
  .trim()
  .refine(
    (value) =>
      value.length > 0 &&
      value
        .split(",")
        .every((item) => ["New", "Featured", "Sale"].includes(item)),
    { message: "Invalid product type" },
  );

const tokenListSchema = z
  .string()
  .trim()
  .regex(/^[A-Za-z0-9]+(?:,[A-Za-z0-9]+)*$/, "Invalid filter value");

const priceFilterSchema = z
  .string()
  .trim()
  .regex(/^\d+(?:\.\d+)?-\d+(?:\.\d+)?$/, "Invalid price range")
  .refine((value) => {
    const [minimum, maximum] = value.split("-").map(Number);
    return (
      Number.isFinite(minimum) && Number.isFinite(maximum) && minimum <= maximum
    );
  }, "Invalid price range");

export const productSortSchema = z.enum([
  "price-low",
  "price-high",
  "newest",
  "featured",
  "rating",
]);

export const filteredProductQuerySchema = z.object({
  search: nonEmptyString.optional(),
  category: categoryFilterSchema.optional(),
  gender: genderFilterSchema.optional(),
  type: typeFilterSchema.optional(),
  price: priceFilterSchema.optional(),
  size: tokenListSchema.optional(),
  color: tokenListSchema.optional(),
  sort: productSortSchema.default("newest"),
  minRating: z.coerce.number().int().min(1).max(5).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const productParamsSchema = z.object({
  slug: nonEmptyString,
  id: objectIdSchema,
});

export const productIdParamSchema = idParamSchema;
export const similarProductParamsSchema = idParamSchema;
export const similarProductIdParamSchema = idParamSchema;
export const productSlugParamsSchema = productParamsSchema;

export const categorySchema = z.object({
  name: nonEmptyString,
  slug: nonEmptyString,
});

export const filteredProductsQuerySchema = filteredProductQuerySchema;
export const productFilterQuerySchema = filteredProductQuerySchema;
export const filterQuerySchema = filteredProductQuerySchema;
export const productListQuerySchema = productQuerySchema;
export const productSearchQuerySchema = searchQuerySchema;
export const productParamSchema = productParamsSchema;
export const similarProductParamSchema = similarProductParamsSchema;
export const productCreateBodySchema = productCreateSchema;
export const productUpdateBodySchema = productUpdateSchema;
export const productVariantsSchemaForCreate = productVariantsSchema;
export const productVariantsSchemaForUpdate = productVariantsUpdateSchema;
export { idParamSchema, objectIdSchema };
