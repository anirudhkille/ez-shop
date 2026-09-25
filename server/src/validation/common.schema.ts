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

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export const nonEmptyString = z
  .string()
  .trim()
  .min(1, "This field is required");

export const emailSchema = z
  .string()
  .trim()
  .email("Valid email is required")
  .max(254, "Email must be at most 254 characters");

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password must be at most 128 characters");

export const loginPasswordSchema = z
  .string()
  .min(1, "Password is required")
  .max(128, "Password must be at most 128 characters");
