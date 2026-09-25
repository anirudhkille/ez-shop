import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  RESET_TOKEN_TTL_MS,
  createResetToken,
  hashResetToken,
  resetSessionKey,
} from "./passwordReset.js";

describe("password reset tokens", () => {
  it("creates random tokens with a bounded lifetime", () => {
    const first = createResetToken();
    const second = createResetToken();

    assert.equal(first.length, 64);
    assert.notEqual(first, second);
    assert.equal(RESET_TOKEN_TTL_MS, 10 * 60 * 1000);
  });

  it("stores only a deterministic hash in the session key", () => {
    const token = "a".repeat(64);
    const hash = hashResetToken(token);
    const key = resetSessionKey(token);

    assert.equal(hash.length, 64);
    assert.match(hash, /^[a-f0-9]{64}$/);
    assert.equal(key, `reset:${hash}`);
    assert.equal(key.includes(token), false);
  });
});
