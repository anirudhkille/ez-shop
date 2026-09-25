import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  addressCreateSchema,
  addressIdParamSchema,
  addressUpdateSchema,
} from "./address.schema.js";

const validAddress = {
  label: "Home" as const,
  name: "Ada Lovelace",
  phone: "9999999999",
  addressLine1: "1 Main Street",
  addressLine2: "Apartment 2",
  zipCode: "400001",
  state: "Maharashtra",
  city: "Mumbai",
  country: "India",
};

const validObjectId = "507f1f77bcf86cd799439011";

describe("address schemas", () => {
  it("accepts a complete address and defaults isDefault", () => {
    const result = addressCreateSchema.parse(validAddress);
    assert.equal(result.isDefault, false);
    assert.equal(result.name, "Ada Lovelace");
  });

  it("requires every create field and only allows supported labels", () => {
    assert.equal(
      addressCreateSchema.safeParse({ ...validAddress, label: "Office" })
        .success,
      false,
    );
    assert.equal(
      addressCreateSchema.safeParse({ ...validAddress, city: " " }).success,
      false,
    );
    const { addressLine2: _addressLine2, ...missingAddressLine2 } =
      validAddress;
    assert.equal(
      addressCreateSchema.safeParse(missingAddressLine2).success,
      false,
    );
  });

  it("allows a non-empty partial update and rejects an empty update", () => {
    assert.equal(addressUpdateSchema.safeParse({ city: "Pune" }).success, true);
    assert.equal(addressUpdateSchema.safeParse({}).success, false);
    assert.equal(
      addressUpdateSchema.safeParse({ unknown: "value" }).success,
      false,
    );
  });

  it("validates address id params", () => {
    assert.equal(
      addressIdParamSchema.safeParse({ id: validObjectId }).success,
      true,
    );
    assert.equal(
      addressIdParamSchema.safeParse({ id: "bad-id" }).success,
      false,
    );
  });
});
