import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  emailSchema,
  idParamSchema,
  loginPasswordSchema,
  nameSchema,
  objectIdSchema,
  paginationQuerySchema,
  passwordSchema,
  phoneSchema,
  zipSchema,
} from "./common.schema.js";

const validObjectId = "507f1f77bcf86cd799439011";

describe("common schemas", () => {
  it("accepts valid ObjectIds and rejects malformed values", () => {
    assert.equal(objectIdSchema.safeParse(validObjectId).success, true);
    assert.equal(objectIdSchema.safeParse("not-an-id").success, false);
    assert.equal(idParamSchema.safeParse({ id: validObjectId }).success, true);
    assert.equal(idParamSchema.safeParse({ id: "not-an-id" }).success, false);
  });

  it("coerces bounded pagination values and applies defaults", () => {
    assert.deepEqual(paginationQuerySchema.parse({ page: "2", limit: "20" }), {
      page: 2,
      limit: 20,
    });
    assert.deepEqual(paginationQuerySchema.parse({}), { page: 1, limit: 10 });
    assert.equal(paginationQuerySchema.safeParse({ page: 0 }).success, false);
    assert.equal(
      paginationQuerySchema.safeParse({ limit: 101 }).success,
      false,
    );
    assert.equal(paginationQuerySchema.safeParse({ page: 1.5 }).success, false);
  });

  it("trims email and enforces the shared password policy", () => {
    assert.equal(
      emailSchema.parse("  person@example.com  "),
      "person@example.com",
    );
    assert.equal(emailSchema.safeParse("not-an-email").success, false);
    assert.equal(passwordSchema.safeParse("short").success, false);
    assert.equal(passwordSchema.safeParse("valid-password").success, true);
    assert.equal(passwordSchema.safeParse("a".repeat(129)).success, false);
    assert.equal(loginPasswordSchema.safeParse("short").success, true);
    assert.equal(loginPasswordSchema.safeParse("").success, false);
  });

  it("rejects digits in names but keeps non-Latin scripts working", () => {
    assert.equal(nameSchema.safeParse("Ada Lovelace").success, true);
    assert.equal(nameSchema.safeParse("O'Brien-Smith Jr.").success, true);
    assert.equal(nameSchema.safeParse("田中 花子").success, true);
    assert.equal(nameSchema.safeParse("John123").success, false);
    assert.equal(nameSchema.safeParse("1234").success, false);
    assert.equal(nameSchema.safeParse("").success, false);
  });

  it("rejects letters in phone numbers but allows dialling punctuation", () => {
    assert.equal(phoneSchema.safeParse("9999999999").success, true);
    assert.equal(phoneSchema.safeParse("+91 98765 43210").success, true);
    assert.equal(phoneSchema.safeParse("(020) 7946-0018").success, true);
    assert.equal(phoneSchema.safeParse("98765abc").success, false);
    assert.equal(phoneSchema.safeParse("12345").success, false);
    assert.equal(phoneSchema.safeParse("").success, false);
  });

  it("rejects letters in zip codes but allows grouping", () => {
    assert.equal(zipSchema.safeParse("400001").success, true);
    assert.equal(zipSchema.safeParse("1234-567").success, true);
    assert.equal(zipSchema.safeParse("abcde").success, false);
    assert.equal(zipSchema.safeParse("12").success, false);
    assert.equal(zipSchema.safeParse("").success, false);
  });
});
