import { z } from "zod";

import { emailSchema, paginationQuerySchema } from "@/validation/common.schema";

export const newsletterSchema = z.object({
  email: emailSchema,
});

export const newsletterPaginationQuerySchema = paginationQuerySchema;
export const newsletterQuerySchema = paginationQuerySchema;
export const subscribeNewsletterSchema = newsletterSchema;
