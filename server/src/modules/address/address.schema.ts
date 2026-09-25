import { z } from "zod";

import { idParamSchema, nonEmptyString } from "@/validation/common.schema";

const addressFields = {
  label: z.enum(["Home", "Work", "Other"]),
  name: nonEmptyString,
  phone: nonEmptyString,
  addressLine1: nonEmptyString,
  addressLine2: nonEmptyString,
  zipCode: nonEmptyString,
  state: nonEmptyString,
  city: nonEmptyString,
  country: nonEmptyString,
  isDefault: z.boolean(),
};

export const addressCreateSchema = z.object({
  ...addressFields,
  isDefault: addressFields.isDefault.default(false),
});

export const addressUpdateSchema = z
  .object({
    label: addressFields.label.optional(),
    name: addressFields.name.optional(),
    phone: addressFields.phone.optional(),
    addressLine1: addressFields.addressLine1.optional(),
    addressLine2: addressFields.addressLine2.optional(),
    zipCode: addressFields.zipCode.optional(),
    state: addressFields.state.optional(),
    city: addressFields.city.optional(),
    country: addressFields.country.optional(),
    isDefault: addressFields.isDefault.optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one address field is required",
  });

export const addressIdParamSchema = idParamSchema;
export const addressParamSchema = idParamSchema;
