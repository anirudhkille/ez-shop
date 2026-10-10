import z from "zod";

import {
  NAME_PATTERN,
  PHONE_PATTERN,
  ZIP_PATTERN,
} from "@/shared/lib/validation-patterns";

import type { GuestDetails } from "../types";

const required = (message: string) => z.string().trim().min(1, message);

export const guestContactSchema = z.object({
  name: required("Enter your full name")
    .regex(NAME_PATTERN, "Name can only contain letters")
    .max(80, "Name is too long"),
  email: z
    .string()
    .trim()
    .min(1, "Enter your email")
    .email("Enter a valid email address"),
  phone: required("Enter your phone number")
    .regex(PHONE_PATTERN, "Phone number can only contain digits")
    .min(6, "Enter a valid phone number"),
});

export const guestAddressSchema = z.object({
  addressLine1: required("Enter your address"),
  addressLine2: z.string().optional(),
  city: required("Enter your city"),
  state: required("Enter your state"),
  zipCode: required("Enter your ZIP code")
    .regex(ZIP_PATTERN, "ZIP code can only contain digits")
    .min(4, "Enter a valid ZIP code"),
  country: required("Enter your country"),
});

const contactIssues = (guest: GuestDetails) =>
  guestContactSchema.safeParse(guest);

const addressIssues = (guest: GuestDetails) =>
  guestAddressSchema.safeParse(guest);

/** Messages keyed by field, for inline display under each input. */
export const guestErrors = (
  guest: GuestDetails,
  section: "contact" | "address"
): Partial<Record<keyof GuestDetails, string>> => {
  const result =
    section === "contact" ? contactIssues(guest) : addressIssues(guest);

  if (result.success) return {};

  return result.error.issues.reduce<
    Partial<Record<keyof GuestDetails, string>>
  >((acc, issue) => {
    const field = issue.path[0] as keyof GuestDetails;
    if (field && !acc[field]) acc[field] = issue.message;
    return acc;
  }, {});
};

export const isGuestContactValid = (guest: GuestDetails): boolean =>
  contactIssues(guest).success;

export const isGuestAddressValid = (guest: GuestDetails): boolean =>
  addressIssues(guest).success;
