import mongoose from "mongoose";
import { z } from "zod";

const objectIdSchema = z
  .string()
  .refine((val) => mongoose.Types.ObjectId.isValid(val), {
    message: "Invalid ObjectId",
  });

export const categorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  slug: z.string().min(1, "Category slug is required"),
});

export const objectIdParamSchema = z.object({
  id: objectIdSchema,
});

export const productQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  publish: z.enum(["true", "false"]).optional(),
  isFeatured: z.enum(["true", "false"]).optional(),
  isNewArrival: z.enum(["true", "false"]).optional(),
});

export const searchQuerySchema = z.object({
  name: z.string().min(1, "Search keyword is required"),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});
