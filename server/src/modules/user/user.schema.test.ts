import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { resetPasswordSchema } from "./user.schema.js";

describe("user schemas", () => {
  it("requires a token and a strong new password for reset", () => {
    assert.equal(
      resetPasswordSchema.safeParse({ token: "reset-token", newPassword: "NewPassword123" })
        .success,
      true,
    );
    assert.equal(resetPasswordSchema.safeParse({ token: "reset-token" }).success, false);
    assert.equal(
      resetPasswordSchema.safeParse({ token: "reset-token", newPassword: "short" })
        .success,
      false,
    );
  });
});
