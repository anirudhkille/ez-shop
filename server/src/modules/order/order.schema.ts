import { z } from "zod";

import {
  emailSchema,
  idParamSchema,
  nameSchema,
  nonEmptyString,
  objectIdSchema,
  optionalNonEmptyString,
  paginationQuerySchema,
  phoneSchema,
  zipSchema,
} from "@/validation/common.schema";

export const deliveryMethodSchema = z.enum(
  ["standard", "express", "same-day"],
  { message: "Invalid delivery method" },
);

export const checkoutAddressSchema = z.object({
  name: nameSchema,
  addressLine1: nonEmptyString,
  addressLine2: optionalNonEmptyString,
  city: nonEmptyString,
  state: nonEmptyString,
  zipCode: zipSchema,
  country: nonEmptyString,
  phone: phoneSchema,
});

export const addressDeliverySchema = z.object({
  addressId: objectIdSchema,
  deliveryMethod: deliveryMethodSchema,
});

const quantitySchema = z
  .number()
  .int("Quantity must be an integer")
  .min(1, "Quantity must be at least 1")
  .max(10, "Quantity cannot exceed 10");

export const guestCheckoutSchema = z.object({
  products: z
    .array(
      z.object({
        productId: objectIdSchema,
        variantId: objectIdSchema.optional(),
        size: nonEmptyString.optional(),
        quantity: quantitySchema,
      }),
    )
    .min(1, "At least one product is required"),
  address: checkoutAddressSchema,
  deliveryMethod: deliveryMethodSchema,
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
});

export const orderStatusUpdateSchema = z
  .object({
    orderStatus: z.enum(["processing", "shipped", "delivered"]).optional(),
    paymentStatus: z.enum(["pending", "paid", "failed"]).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one order status field is required",
  });

export const orderPaginationQuerySchema = paginationQuerySchema;
export const orderQuerySchema = paginationQuerySchema;
export const orderIdParamSchema = idParamSchema;
export const orderIdParamsSchema = idParamSchema;
export const sessionIdParamSchema = z.object({
  sessionId: nonEmptyString,
});

export const authenticatedCheckoutSchema = addressDeliverySchema;
export const orderCheckoutSchema = addressDeliverySchema;
export const checkoutSchema = addressDeliverySchema;
export const guestOrderSchema = guestCheckoutSchema;
export const updateOrderSchema = orderStatusUpdateSchema;
export const orderStatusSchema = orderStatusUpdateSchema;
export { idParamSchema };
