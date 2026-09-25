import { z } from "zod";

import {
  emailSchema,
  nonEmptyString,
  passwordSchema,
} from "@/validation/common.schema";

export const adminLoginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const adminForgotPasswordSchema = z.object({
  email: emailSchema,
});

export const adminResetPasswordSchema = z.object({
  token: nonEmptyString,
  password: passwordSchema,
});

export const adminProfileUpdateSchema = z
  .object({
    name: nonEmptyString.optional(),
    phone: nonEmptyString.optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one profile field is required",
  });

export const loginSchema = adminLoginSchema;
export const forgotPasswordSchema = adminForgotPasswordSchema;
export const resetPasswordSchema = adminResetPasswordSchema;
export const profileUpdateSchema = adminProfileUpdateSchema;
export const adminProfileSchema = adminProfileUpdateSchema;
