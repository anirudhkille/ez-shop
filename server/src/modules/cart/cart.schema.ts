import { z } from "zod";

import { nonEmptyString, objectIdSchema } from "@/validation/common.schema";

const quantitySchema = z
  .number()
  .int("Quantity must be an integer")
  .min(1, "Quantity must be at least 1")
  .max(10, "Quantity cannot exceed 10");

export const addToCartSchema = z.object({
  productId: objectIdSchema,
  variantId: objectIdSchema.optional(),
  size: nonEmptyString.optional(),
  quantity: quantitySchema.default(1),
});

export const updateCartSchema = z.object({
  cartItemId: objectIdSchema,
  quantity: quantitySchema,
});

export const cartItemIdParamSchema = z.object({
  cartItemId: objectIdSchema,
});

export const cartAddSchema = addToCartSchema;
export const cartUpdateSchema = updateCartSchema;
export const cartItemParamSchema = cartItemIdParamSchema;
