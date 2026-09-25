import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  emailSchema,
  idParamSchema,
  objectIdSchema,
  paginationQuerySchema,
  passwordSchema,
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
  });
});
