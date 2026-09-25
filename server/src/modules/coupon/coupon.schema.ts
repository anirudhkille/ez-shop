import { z } from "zod";

import {
  idParamSchema,
  nonEmptyString,
  paginationQuerySchema,
} from "@/validation/common.schema";

const couponCodeSchema = z
  .string()
  .trim()
  .min(2, "Code must be at least 2 characters")
  .max(32, "Code must be at most 32 characters")
  .regex(/^[A-Za-z0-9_-]+$/, "Code may only contain letters, numbers, - and _")
  .transform((value) => value.toUpperCase());

const baseCouponFields = {
  description: nonEmptyString.optional(),
  minOrderValue: z.coerce.number().min(0).optional(),
  maxDiscountAmount: z.coerce.number().positive().optional(),
  maxUses: z.coerce.number().int().min(1).optional(),
  maxUsesPerUser: z.coerce.number().int().min(1).optional(),
  expiresAt: z.coerce.date().optional(),
  active: z.coerce.boolean().optional(),
};

export const couponCreateSchema = z
  .object({
    code: couponCodeSchema,
    type: z.enum(["percentage", "fixed"]),
    value: z.coerce.number().positive("Value must be greater than 0"),
    ...baseCouponFields,
  })
  .superRefine((value, ctx) => {
    if (value.type === "percentage" && value.value > 100) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["value"],
        message: "Percentage cannot exceed 100",
      });
    }

    if (value.type === "fixed" && value.maxUsesPerUser) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["maxUsesPerUser"],
        message: "Per-user limit only applies to percentage coupons",
      });
    }
  });

export const couponUpdateSchema = z
  .object({
    type: z.enum(["percentage", "fixed"]).optional(),
    value: z.coerce.number().positive().optional(),
    ...baseCouponFields,
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one coupon field is required",
  });

export const couponValidateSchema = z.object({
  code: couponCodeSchema,
  subtotal: z.coerce.number().min(0),
});

export const couponPaginationQuerySchema = paginationQuerySchema.extend({
  search: z.string().trim().optional(),
});

export const couponIdParamSchema = idParamSchema;
