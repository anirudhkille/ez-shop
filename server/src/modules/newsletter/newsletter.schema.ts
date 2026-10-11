import { z } from "zod";

import { emailSchema, paginationQuerySchema } from "@/validation/common.schema";

export const newsletterSchema = z.object({
  email: emailSchema,
});

export const newsletterPaginationQuerySchema = paginationQuerySchema;
