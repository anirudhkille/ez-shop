import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { userPaginationQuerySchema } from "./user.schema.js";

describe("admin user list query schema", () => {
  it("accepts a search term and role filter", () => {
    const result = userPaginationQuerySchema.parse({
      search: " ada ",
      role: "Admin",
    });
    assert.equal(result.search, "ada");
    assert.equal(result.role, "Admin");
  });

  it("allows both to be omitted", () => {
    assert.equal(userPaginationQuerySchema.safeParse({}).success, true);
  });

  it("rejects an unknown role and an over-long search", () => {
    assert.equal(
      userPaginationQuerySchema.safeParse({ role: "Superuser" }).success,
      false,
    );
    assert.equal(
      userPaginationQuerySchema.safeParse({ search: "x".repeat(121) }).success,
      false,
    );
  });
});
