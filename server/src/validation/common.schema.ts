import mongoose from "mongoose";
import { z } from "zod";

export const objectIdSchema = z
  .string()
  .trim()
  .min(1, "ObjectId is required")
  .refine((value) => mongoose.Types.ObjectId.isValid(value), {
    message: "Invalid ObjectId",
  });

export const idParamSchema = z.object({
  id: objectIdSchema,
});

export const objectIdParamSchema = idParamSchema;

export const orderIdParamSchema = z.object({
  orderId: objectIdSchema,
});

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export const nonEmptyString = z
  .string()
  .trim()
  .min(1, "This field is required");

export const optionalNonEmptyString = z.preprocess(
  (value) =>
    typeof value === "string" && value.trim() === "" ? undefined : value,
  nonEmptyString.optional(),
);

export const emailSchema = z
  .string()
  .trim()
  .email("Valid email is required")
  .max(254, "Email must be at most 254 characters");

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password must be at most 128 characters");

/** Letters plus the separators that legitimately appear in names. */
export const nameSchema = z
  .string()
  .trim()
  .min(1, "Name is required")
  .regex(/^[\p{L}\p{M}'’.\- ]+$/u, "Name can only contain letters")
  .max(80, "Name must be at most 80 characters");

/** Digits with the punctuation dialling formats actually use. */
export const phoneSchema = z
  .string()
  .trim()
  .min(1, "Phone number is required")
  .regex(/^\+?[\d\s\-().]+$/, "Phone number can only contain digits")
  .min(6, "Phone number must be at least 6 characters")
  .max(20, "Phone number must be at most 20 characters");

/** Digits with optional space/hyphen grouping, e.g. 400001 or 1234-567. */
export const zipSchema = z
  .string()
  .trim()
  .min(1, "Zip code is required")
  .regex(/^[\d\s-]+$/, "Zip code can only contain digits")
  .min(4, "Zip code must be at least 4 characters")
  .max(12, "Zip code must be at most 12 characters");

export const loginPasswordSchema = z
  .string()
  .min(1, "Password is required")
  .max(128, "Password must be at most 128 characters");
