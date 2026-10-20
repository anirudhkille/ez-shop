import { z } from "zod";

import {
  emailSchema,
  idParamSchema,
  loginPasswordSchema,
  nonEmptyString,
  paginationQuerySchema,
  passwordSchema,
  searchQuerySchema,
} from "@/validation/common.schema";

export const signupSchema = z.object({
  name: nonEmptyString,
  email: emailSchema,
  password: passwordSchema,
});

/** `client` lets the app ask for the refresh token in the body too. */
export const loginSchema = z.object({
  email: emailSchema,
  password: loginPasswordSchema,
  client: z.literal("app").optional(),
});

export const verifySignupOTPSchema = z.object({
  email: emailSchema,
  otp: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "OTP must be 6 digits"),
  client: z.literal("app").optional(),
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z.object({
  token: nonEmptyString,
  newPassword: passwordSchema,
});

export const profileUpdateSchema = z
  .object({
    name: nonEmptyString.optional(),
    phone: nonEmptyString.optional(),
    avatar: nonEmptyString.optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one profile field is required",
  });

export const passwordUpdateSchema = z.object({
  currentPassword: passwordSchema,
  newPassword: passwordSchema,
});

export const userPaginationQuerySchema = paginationQuerySchema.extend({
  search: searchQuerySchema,
  role: z.enum(["User", "Admin"]).optional(),
});
export const userIdParamSchema = idParamSchema;

/** The app posts the ID token from Google Play Services, not an OAuth code. */
export const googleMobileSchema = z.object({
  idToken: nonEmptyString,
});

/** App-only refresh: body token instead of the web cookie. */
export const appRefreshSchema = z.object({
  client: z.literal("app"),
  refreshToken: nonEmptyString,
});
