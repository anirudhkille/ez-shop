import { z } from "zod";

import {
  idParamSchema,
  nonEmptyString,
  paginationQuerySchema,
} from "@/validation/common.schema";

export const categoryCreateSchema = z.object({
  name: nonEmptyString,
  slug: nonEmptyString,
  image: nonEmptyString,
});

export const categoryUpdateSchema = z
  .object({
    name: nonEmptyString.optional(),
    slug: nonEmptyString.optional(),
    image: nonEmptyString.optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one category field is required",
  });

export const categoryPaginationQuerySchema = paginationQuerySchema;
export const categoryQuerySchema = paginationQuerySchema;
export const categoryIdParamSchema = idParamSchema;
export const objectIdParamSchema = idParamSchema;

export const categorySchema = categoryCreateSchema;
