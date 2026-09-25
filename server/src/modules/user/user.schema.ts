import { z } from "zod";

import {
  emailSchema,
  idParamSchema,
  loginPasswordSchema,
  nonEmptyString,
  paginationQuerySchema,
  passwordSchema,
} from "@/validation/common.schema";

export const signupSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: emailSchema,
  password: loginPasswordSchema,
});

export const verifySignupOTPSchema = z.object({
  email: emailSchema,
  otp: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "OTP must be 6 digits"),
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

export const userPaginationQuerySchema = paginationQuerySchema;
export const userQuerySchema = paginationQuerySchema;
export const userIdParamSchema = idParamSchema;
export { idParamSchema };

export const updateProfileSchema = profileUpdateSchema;
export const updatePasswordSchema = passwordUpdateSchema;
export const verifySignupSchema = verifySignupOTPSchema;
export const signupVerificationSchema = verifySignupOTPSchema;
export const userProfileSchema = profileUpdateSchema;
export const userPasswordSchema = passwordUpdateSchema;
export const userResetPasswordSchema = resetPasswordSchema;
export const userListQuerySchema = paginationQuerySchema;
