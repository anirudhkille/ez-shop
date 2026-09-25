import { z } from "zod";

import { objectIdSchema } from "@/validation/common.schema";

export const wishlistSchema = z.object({
  productId: objectIdSchema,
});

export const toggleWishlistSchema = wishlistSchema;
