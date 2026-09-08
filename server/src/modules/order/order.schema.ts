import { z } from "zod";

export const addressDeliverySchema = z.object({
  addressId: z.string().min(1, "Address is required"),
  deliveryMethod: z.enum(["standard", "express", "same-day"], {
    message: "Invalid delivery method",
  }),
});

const addressSchema = z.object({
  name: z.string().min(1, "Name is required"),
  addressLine1: z.string().min(1, "Address line 1 is required"),
  addressLine2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zipCode: z.string().min(1, "Zip code is required"),
  country: z.string().min(1, "Country is required"),
  phone: z.string().min(1, "Phone is required"),
});

export const guestCheckoutSchema = z.object({
  products: z
    .array(
      z.object({
        productId: z.string().min(1, "Product ID is required"),
        variantId: z.string().optional(),
        size: z.string().optional(),
        quantity: z
          .number()
          .int()
          .min(1, "Quantity must be at least 1")
          .max(10, "Quantity cannot exceed 10"),
      }),
    )
    .min(1, "At least one product is required"),
  address: addressSchema,
  deliveryMethod: z.enum(["standard", "express", "same-day"], {
    message: "Invalid delivery method",
  }),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(1, "Phone is required"),
});
