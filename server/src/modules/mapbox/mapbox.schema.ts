import { z } from "zod";

const sessionTokenSchema = z.string().trim().min(1).max(128);

export const mapboxSuggestQuerySchema = z.object({
  q: z.string().trim().min(3).max(120),
  sessionToken: sessionTokenSchema,
});

export const mapboxRetrieveParamsSchema = z.object({
  mapboxId: z
    .string()
    .trim()
    .min(1)
    .max(256)
    .regex(/^[A-Za-z0-9][A-Za-z0-9._-]*$/, "Invalid Mapbox ID"),
});

export const mapboxRetrieveQuerySchema = z.object({
  sessionToken: sessionTokenSchema,
});
