import { z } from "zod";

import {
  idParamSchema,
  nonEmptyString,
  objectIdSchema,
  paginationQuerySchema,
} from "@/validation/common.schema";

export const reviewCreateSchema = z.object({
  productId: objectIdSchema,
  rating: z
    .number()
    .int("Rating must be an integer")
    .min(1, "Rating must be between 1 and 5")
    .max(5, "Rating must be between 1 and 5"),
  comment: nonEmptyString.optional(),
});

export const reviewUpdateSchema = z
  .object({
    rating: z
      .number()
      .int("Rating must be an integer")
      .min(1, "Rating must be between 1 and 5")
      .max(5, "Rating must be between 1 and 5")
      .optional(),
    comment: nonEmptyString.optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one review field is required",
  });

export const reviewProductParamSchema = z.object({
  productId: objectIdSchema,
});
export const reviewIdParamSchema = idParamSchema;
export const reviewPaginationQuerySchema = paginationQuerySchema;
